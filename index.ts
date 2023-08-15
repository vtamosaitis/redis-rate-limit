import Redis from 'ioredis';
import { ServiceQueueProcessor } from './ServiceQueueProcessor';
import { calculateTotal } from './calculateTotalService';

async function testServiceQueueProcessor() {
    const redisClient = new Redis({
        host: 'localhost', // Replace with your Redis server details
        port: 6379, // Replace with your Redis server port
    });

    const serviceQueueProcessor = new ServiceQueueProcessor(redisClient);

    // Simulate scheduling CalculateTotal function calls
    addEvents(serviceQueueProcessor);

    // Simulate normal program work for 20 seconds
    const startTime = Date.now();
    const endTime = startTime + 120000; // 120 seconds from now
    function eventLoop() {
        const currentTime = Date.now();
        const runTime = currentTime - startTime;
        console.log(`Run time: ${runTime}ms`);

        if (currentTime < endTime) {
            setTimeout(eventLoop, 1000);
        } else {
            console.log('Event loop finished.');
            // Close the Redis connection
            redisClient.quit();
        }
    }

    console.log('Event loop starting...');
    eventLoop();
}

testServiceQueueProcessor().catch(error => {
    console.error('Error in testServiceQueueProcessor:', error);
});

async function addEvents(serviceQueueProcessor: ServiceQueueProcessor): Promise<void> {
    try {
        const res = [];
        // each schedule event blocks the successive events because of await, but should not block the event loop
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(0, 0));
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(0, 1));
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(1, 1));
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(1, 2));
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(2, 2));
        res.push(await serviceQueueProcessor.scheduleCalculateTotal(2, 3));
        console.log('All events added');
        for (const val of res) {
            console.log('results:', val);
        }
        console.log('Queue length:', await serviceQueueProcessor.getJobCount());
        console.log('Queue delayed #:', await serviceQueueProcessor.getDelayedCount());
    } catch (error) {
        console.error('There was an error processing on of the jobs');
    }
}

// import { Queue, QueueEvents, Worker } from 'bullmq';

// class JobProcessor {
  // private queue: Queue;
  // private queueEvents: QueueEvents;
  // private worker: Worker;

  // constructor() {
    // this.queue = new Queue('myQueue');
    // this.queueEvents = new QueueEvents('myQueue');

    // // Create a worker to process jobs
    // this.worker = new Worker('myQueue', async job => {
      // try {
        // const randomDelay = Math.random() * 3000;
        // await new Promise(resolve => setTimeout(resolve, randomDelay));
        // const processedResult = `Processed job with data: ${job.data.some}`;
        // console.log(processedResult);
        // return job.data.some;
      // } catch (error) {
        // console.error(`Error processing job: ${error.message}`);
      // }
    // });
  // }

  // async addJob(data) {
    // const job = await this.queue.add('jobName', data);
    // return job;
  // }

  // async processJobAndWait(job) {
    // try {
      // const result = job.waitUntilFinished(this.queueEvents);
      // console.log(result);
      // return result; // Return resolved result
    // } catch (error) {
      // console.error('Error while waiting for job completion:', error.message);
      // throw new Error(`Job failed with reason: ${error.failedReason}`);
    // }
  // }

  // async closeQueue() {
    // await this.worker.close(); // Close the worker
    // this.queueEvents.close();
  // }
// }

// async function main() {
  // const processor = new JobProcessor();

  // try {
    // const jobDataArray = [
      // { some: 1 },
      // { some: 2 },
      // { some: 3 }
      // // Add more job data objects here as needed
    // ];

    // const promises = [];
    // for (const jobData of jobDataArray) {
      // const job = await processor.addJob(jobData);
      // console.log('Job added to the queue:', job.id);

      // const promise = processor.processJobAndWait(job);
      // console.log('Job promise received.');

      // console.log('---'); // Print a separator between jobs
      // promises.push(promise);
    // }
    // console.log('Before:', promises);
    // for (const promise of promises) {
        // await promise;
    // }
    // console.log('After:', promises);
  // } catch (error) {
    // console.error('Error:', error.message);
  // } finally {
    // await processor.closeQueue();
  // }
// }

// main();
