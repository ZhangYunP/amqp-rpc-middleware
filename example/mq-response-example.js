const { RpcResponse } = require('../index')

const options = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  vhost: '/v1',
  username: 'polo',
  password: 'aaa'
}

const fib = (n) => {
  return n === 1 || n === 2
    ? 1
    : fib(n-1) + fib(n-2)
}


const server = new RpcResponse(options);

  (async () => {
    await server.start();
  })()

server.registerController.register('fib', fib)