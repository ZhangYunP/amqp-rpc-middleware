const amqp = require('amqplib')

class RpcBase {
  constructor(options)  {
    this.conn = null
    this.ch = null
    this.started = false
    this.opts = options || {}
  } 

 async connect(opts) {
    const uri = {
      protocol: opts.protocol || 'amqp',
      hostname: opts.host || 'localhost',
      port: opts.port || 5672,
      vhost: opts.vhost || '/',
      username: opts.username || 'guest',
      password: opts.password || 'guest'
    }
    try {
      this.conn = await amqp.connect(uri)
    } catch (e) {
      throw e
    }
  }
  
  async start() {
      await this.connect(this.opts)
      this.ch = await this.conn.createChannel()
  }

  async close() {
    await this.ch.close()
    await this.conn.close()
  }
}

module.exports = RpcBase