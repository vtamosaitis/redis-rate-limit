import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { calculateTotal } from './calculateTotalService';

export class ServiceQueueProcessor {
    private redisClient: Redis.Redis;
    private queue: Queue;
    private worker: Worker;
    private queueScheduler: QueueScheduler;

    constructor(redisClient: Redis.Redis) {
        this.redisClient = redisClient;

        const redisConnectionOptions: Redis.ConnectionOptions = {
            host: this.redisClient.options.host,
            port: this.redisClient.options.port,
        };

        this.queue = new Queue('service_queue', {
            connection: redisConnectionOptions,
        });

        this.worker = new Worker('service_queue', async job => {
            try {
                const serviceName = job.data.serviceName;
                const args = job.data.args;

                await this.calculateTotal(args[0], args[1]);

                console.log('Service function call processed:', serviceName);
            } catch (error) {
                console.error('Error processing service function call:', error);
            }
        });

        this.queueScheduler = new QueueScheduler('service_queue', {
            connection: redisConnectionOptions,
            limiter: {
                max: 3, // Process 3 jobs at a time
                duration: 1000, // 1 second delay between batches
            },
        });
        
        console.log('New ServiceQueueProcessor created.');
    }

    async scheduleCalculateTotal(a: number, b: number): Promise<void> {
        try {
            await this.queue.add('calculate_total', { a, b });
            console.log('CalculateTotal function call scheduled');
        } catch (error) {
            console.error('Error scheduling CalculateTotal function call:', error);
        }
    }

    private async calculateTotal(a: number, b: number): Promise<void> {
        // Implement your calculation logic here
        const total = await calculateTotal(a, b);
        console.log(`Total: ${total}`);
    }
}
