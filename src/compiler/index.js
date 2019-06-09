import Parser from './parser'
import Render from './render'

function Complier () {
  this.parser = new Parser()
  this.render = new Render()
}

Complier.prototype.parse = function (str) {
  return this.parser.parse(str)
}

Complier.prototype.render = function (ast) {
  return this.render.render(ast)
}

export default Complier
