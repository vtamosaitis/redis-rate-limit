# redis-rate-limit
Test rate limiting using redis with bullmq

## Instructions
Start a redis-server on default port 6379. From the `bullmq-redis-test` directory:
`npm i`
`npm run build`
`npm run start`
You should see addition calculation output results from 0 to 5 in between runtime outputs that print every second from a simulated event loop.
