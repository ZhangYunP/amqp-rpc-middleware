const { RpcRequest } = require('../index')

const options = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  vhost: '/v1',
  username: 'polo',
  password: 'aaa'
}

const client = new RpcRequest(options);

(async () => {
  await client.start();
  for (let i = 1; i < 10; i++) {
    const result = await client.invoke('fib', i)
    console.log(result)
  }
})()