import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import ConnectionOptions from 'ioredis';
import { calculateTotal } from './calculateTotalService';

export class ServiceQueueProcessor {
    private redisClient: Redis;
    private queue: Queue;
    private worker: Worker;
    private queueEvents: QueueEvents;

    constructor(redisClient: Redis) {
        this.redisClient = redisClient;

        this.queue = new Queue('service_queue', {
            connection: this.redisClient,
        });
        
        this.queueEvents = new QueueEvents('service_queue');
       
        this.worker = new Worker('service_queue', async job => {
            const serviceName = job.name;
            const args = job.data;
            console.log("Parameters: ", serviceName, args);

            const res = await this.calculateTotal(args[0], args[1]);

            console.log('Service function call processed:', serviceName);
            return res;
        }, {
            limiter: {
                max: 2, // Process 1 job at a time
                duration: 3000, // 3 second delay between batches
            },
            concurrency: 2,
        });
        this.listenEvents(this.worker);


        console.log('New ServiceQueueProcessor created.');
    }

    async scheduleCalculateTotal(a: number, b: number): Promise<number|void> {
        try {
            const jobPromise = this.queue.add('calculate_total', [ a, b ],
                { removeOnComplete: true }
            );
            console.log('CalculateTotal function call scheduled');
            console.log('Queue length after scheduled:', await this.getJobCount());
            const job = await jobPromise;
            const promiseResult = job.waitUntilFinished(this.queueEvents);
            return promiseResult;
        } catch (error) {
            console.error('Error scheduling CalculateTotal function call:', error);
        }
    }
    
    async getJobCount(): Promise<number> {
        return this.queue.count();
    }
    
    async getDelayedCount(): Promise<number> {
        return this.queue.getDelayedCount();
    }
    
    async cleanQueue(queue: Queue): Promise<void> {
        await queue.obliterate();
    }
    
    private async calculateTotal(a: number, b: number): Promise<number> {
        // Implement your calculation logic here
        const total = await calculateTotal(a, b);
        console.log(`Total: ${total}`);
        return total;
    }
    
    private listenEvents(worker: Worker): void {
        worker.on('completed', (job: Job, returnvalue: any) => {
            console.log(`${job.name}:${job.id}::${job.data} completed with returnValue ${returnvalue}`);
        });
        worker.on('failed', (job: Job, error: any) => {
            console.log(`${job.name}:${job.id}::${job.data} failed with error ${error}`);
        });
        worker.on('error', (failedReason) => {
            console.log(`ERROR error event received from job processor queue: ${failedReason}`);
        });
        worker.on('stalled', async (jobId: string) => {
            const data = (await this.queue.getJob(jobId)).data;
            console.log(`${jobId} stalled with data: ${data}`);
        });
    }
}
/*
Error data for Redis connection refused
Error: connect ECONNREFUSED 127.0.0.1:6379
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16) {
  errno: -4078,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 6379
}
*/