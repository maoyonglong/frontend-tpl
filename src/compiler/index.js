import Parser from './parser'
import Renderer from './render'

/**
 * @class Complier
 */
function Complier () {
  /**
   * @description an instance of Parser
   * @memberOf Complier
   */
  this.parser = new Parser()
  /**
   * @memberof Complier
   * @description an instance of Renderer
   */
  this.renderer = new Renderer()
}

/**
 * @description parse the html string
 * @for Complier
 * @param { string } str html string
 * @return { Array } ast
 */
Complier.prototype.parse = function (str) {
  return this.parser.parse(str)
}

/**
 * @description render the ast
 * @for Compiler
 * @param { Array } ast ast
 * @param { Object } data the template data
 */
Complier.prototype.render = function (ast, data) {
  return this.renderer.render(ast, data)
}

/**
 * @description override the function of Renderer
 * @param { string } name the function name
 * @param { function } func the function
 */
Complier.prototype.overrideRender = function (name, func) {
  Renderer.prototype[name] = func
}

export default Complier
