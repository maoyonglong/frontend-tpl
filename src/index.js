import Compiler from './compiler'

function Tpl (str) {
  this.str = str
  this.compiler = new Compiler()
}

Tpl.prototype.parse = function (str) {
  this._ast = this.compiler.parse(this.str || str)
  return this
}

Tpl.prototype.render = function (str) {
  this._dom = this.compiler.render(this._ast || str)
  return this
}

export default Tpl
