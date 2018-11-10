class RegisterController {
  constructor() {
    this._functions = new Map()
  }

  register(funcName, func) {
    return !this.has(funcName) && this._functions.set(funcName, func)
  }

  find(funcName) {
    return this.has(funcName) && this._functions.get(funcName)
  }

  unregister(funcName) {
    return this.has(funcName) && this._functions.delete(funcName)
  }

  has(funcName) {
    return this._functions.has(funcName)
  }

  get size() {
    return this._functions.size
  }

  clearAll() {
    this._functions.clear()
  }
}

module.exports = RegisterController