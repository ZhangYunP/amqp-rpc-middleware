const uuid = require('uuid')
const RpcBase = require('./mq-base')

class RpcRequest extends RpcBase {
  constructor(options) {
    super(options)
    this.replyQ = null
    this.requests = new Map()
    this.consumerTag = null
    this._handleReply = this._handleReply.bind(this)
  }

  async start() {
    try {
      if (!this.started) {
        await super.start()
        if (!this.replyQ) {
          const replyqueue = await this.ch.assertQueue('', { exclusive: true })
          this.replyQ = replyqueue.queue
        }
        const result = await this.ch.consume(this.replyQ, this._handleReply, { noAck: true })
        this.consumerTag = result.consumerTag
        this.started = true
      }
    } catch (e) {
      throw e
    }
  }

  async invoke(...args) {
    let resolve, reject
    const content = this._handleData(args)
    const uid = uuid()

    try {
      await this.ch.sendToQueue(this.opts.requestQueueName || 'rpc_request', content, {
        correlationId: uid,
        replyTo: this.replyQ
      })
    } catch (e) {
      throw e
    }

    const timer = this.opts.timeout != undefined
      ? setTimeout(() => this._cancelById(uid, 'long time do not recive this response form reply queue'), this.opts.timeout)
      : null

    const p = new Promise((resv, rejt) => {
      resolve = resv
      reject = rejt
    })

    this.requests.set(uid, {
      resolve,
      reject,
      timer
    })

    return p
  }

  async close() {
    await this.ch.cancel(this.consumerTag)
    await this.ch.deleteQueue(this.replyQ)
    this.requests.forEach(request => {
      const { timer } = request
      clearTimeout(timer)
    })
    this.requests.clear()
    await super.close()
  }

  _handleData(args) {
    let func, marg
    if (typeof args[0] === 'string') {
      func = args[0]
      marg = args.slice(1)
    } else {
      func = args[0].func
      marg = args[0].marg
    }
    
    return Buffer.from(JSON.stringify({ func, args: marg }))
  }

  _handleReply(msg) {
    const corrid = msg.properties.correlationId
    const { resolve, timer } = this.requests.get(corrid)
    this.requests.delete(corrid)
    clearTimeout(timer)
    resolve(msg.content.toString())
  }

  _cancelById(corrid, msg) {
    if (corrid) {
      const { reject } = this.requests.get(corrid)
      reject(new Error(msg))
    }
  }
}

module.exports = RpcRequest

