import Compiler from './compiler'

function Tpl (str) {
  this.str = str
  this.compiler = new Compiler()
}

Tpl.prototype.parse = function (str) {
  this._ast = this.compiler.parse(this.str || str)
  return this
}

Tpl.prototype.render = function (ast) {
  this._dom = this.compiler.render(this._ast || ast)
  return this
}

Tpl.prototype.overrideRender = function (name, func) {
  this.compiler.overrideRender(name, func)
}

export default Tpl
