import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import ConnectionOptions from 'ioredis';
import { calculateTotal } from './calculateTotalService';

export class ServiceQueueProcessor {
    private redisClient: Redis;
    private queue: Queue;
    private worker: Worker;

    constructor(redisClient: Redis) {
        this.redisClient = redisClient;

        this.queue = new Queue('service_queue', {
            connection: this.redisClient,
        });

        this.worker = new Worker('service_queue', async job => {
            try {
                const serviceName = job.name;
                const args = job.data;
                console.log("Parameters: ", serviceName, args[0]);

                await this.calculateTotal(args[0], args[1]);

                console.log('Service function call processed:', serviceName);
            } catch (error) {
                console.error('Error processing service function call:', error);
            }
        }, {
            limiter: {
                max: 1, // Process 1 job at a time
                duration: 3000, // 3 second delay between batches
            },
        });
        
        console.log('New ServiceQueueProcessor created.');
    }

    async scheduleCalculateTotal(a: number, b: number): Promise<void> {
        try {
            await this.queue.add('calculate_total', [ a, b ]);
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
