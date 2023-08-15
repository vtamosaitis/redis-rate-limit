# redis-rate-limit
Test rate limiting using redis with bullmq

## Instructions
Start a redis-server on default port 6379. From the `redis-rate-limit` directory: <br>
`npm i` <br>
`npm run build` <br>
`npm run start` <br>
You should see addition calculation output results from 0 to 5 in between runtime outputs that print at a rate limited to 2 every 3 seconds a simulated event loop.
