import Queue from 'bull';
import Redis from 'ioredis';
import { calculateTotal } from './calculateTotalService';

export class ServiceQueueProcessor {
    private redisClient: Redis;
    private queue: Queue.Queue;

    constructor(redisClient: Redis) {
        this.redisClient = redisClient;

        this.queue = new Queue('service_queue', {
            redis: {
                host: 'localhost',
                port: 6379
            },
            limiter: {
                max: 2, // Process 2 job at a time
                duration: 5000, // 5 second delay between batches
            },
        });
        
        this.queue.process('*', async job => {
            const serviceName = job.name;
            const args = job.data;
            console.log("Parameters: ", serviceName, args);

            const res = await this.calculateTotal(args[0], args[1]);

            return res;
        });

        console.log('New ServiceQueueProcessor created.');
    }

    async scheduleCalculateTotal(a: number, b: number): Promise<number | void> {
        try {
            const job = await this.queue.add('calculate_total', [a, b], {
                removeOnComplete: true,
            });

            const result = await job.finished();

            return result;
        } catch (error) {
            console.error('Error scheduling CalculateTotal function call:', error);
        }
    }

    async getJobCount(): Promise<number> {
        const jobCounts = await this.queue.getJobCounts();
        return jobCounts.active + jobCounts.waiting + jobCounts.delayed + jobCounts.completed;
    }

    async cleanQueue(): Promise<void> {
        await this.queue.clean(0, 'completed');
    }
    
    private async calculateTotal(a: number, b: number): Promise<number> {
        console.log(`calculateTotal: ${a}, ${b}`);
        const total = await calculateTotal(a, b);
        console.log(`Total: ${total}`);
        return total;
    }
}