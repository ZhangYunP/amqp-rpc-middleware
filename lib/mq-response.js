const RpcBase = require('./mq-base')
const RegisterController = require('./registerController')

class RpcResponse extends RpcBase{
  constructor(options)  {
    super(options)
    this.requestQ = options.requestQ || 'rpc_request'
    this.registerController = new RegisterController()
    this._handleRequest = this._handleRequest.bind(this)
  } 

  async start() {
    try {
      if (!this.started) {
        await super.start()
        await this.ch.assertQueue(this.requestQ, { durable: false })
        await this.ch.consume(this.requestQ, this._handleRequest)
        await this.ch.prefetch(1)
      }
    } catch (e) {
      throw e
    }
  }

  async _handleRequest(msg) {
    try {
      const { correlationId, replyTo } = msg.properties
      const result = this._parseMessage(msg)
      await this.ch.sendToQueue(replyTo, result, { correlationId })
      console.log(`send fib result to ${correlationId}, wait for next request`)
      await this.ch.ack(msg)
    } catch (e) {
      throw e
    }
  }

  _parseMessage(msg) {
    const str = msg.content.toString('utf8')
    const { func, args } = JSON.parse(str)
    const fun = this.registerController.find(func)
    const result = fun.apply(null, args) 
    return Buffer.from(JSON.stringify(result))
  }

  async close() {
    await super.close()
  }
}

module.exports = RpcResponse

