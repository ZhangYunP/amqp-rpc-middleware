require('should')
const { RpcRequest } = require('../index')


const options = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  vhost: '/v1',
  username: 'polo',
  password: 'aaa'
}

const client = new RpcRequest(options)

describe('rabbit mq request', () => {
  it('request', () => {
    (async () => {
      await client.start();
      for (let i = 1; i < 10; i++) {
        const result = await client.invoke(i)
      }
    })()
  })
})