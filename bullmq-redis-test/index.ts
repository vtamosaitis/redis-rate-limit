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
    await serviceQueueProcessor.scheduleCalculateTotal(10, 20);
    await serviceQueueProcessor.scheduleCalculateTotal(5, 7);
    await serviceQueueProcessor.scheduleCalculateTotal(100, 200);

    // Busy-wait loop to simulate work
    const startTime = Date.now();
    const endTime = startTime + 15000; // 15 seconds from now
    while (Date.now() < endTime) {
        const currentTime = Date.now();
        const runTime = currentTime - startTime;
        console.log(`Run time: ${runTime}ms`);

        // Wait for 1 second before the next iteration
        const nextTime = currentTime + 1000;
        while (Date.now() < nextTime) {
            // Busy-wait
        }
    }

    // Close the Redis connection
    redisClient.quit();
}

testServiceQueueProcessor().catch(error => {
    console.error('Error in testServiceQueueProcessor:', error);
});
