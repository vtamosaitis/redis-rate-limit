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
    await serviceQueueProcessor.scheduleCalculateTotal(0, 0);
    await serviceQueueProcessor.scheduleCalculateTotal(0, 1);
    await serviceQueueProcessor.scheduleCalculateTotal(1, 1);
    await serviceQueueProcessor.scheduleCalculateTotal(1, 2);
    await serviceQueueProcessor.scheduleCalculateTotal(2, 2);
    await serviceQueueProcessor.scheduleCalculateTotal(2, 3);


    // Simulate normal program work for 15 seconds
    const startTime = Date.now();
    const endTime = startTime + 15000; // 15 seconds from now
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
