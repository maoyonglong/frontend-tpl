import Parser from './parser'
import Render from './render'

function Complier () {
  this.parser = new Parser()
  this.renderer = new Render()
}

Complier.prototype.parse = function (str) {
  return this.parser.parse(str)
}

Complier.prototype.render = function (ast) {
  return this.renderer.render(ast)
}

Complier.prototype.overrideRender = function (name, func) {
  Render.prototype[name] = func
}

export default Complier
