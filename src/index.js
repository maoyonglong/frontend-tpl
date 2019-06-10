import Compiler from './compiler'

/**
 * @class Tpl
 * @param { string } [str] htmlString
 * @param { object } [data] the data in template
 */
function Tpl (str, data) {
  /**
   * @description store the html string
   * @memberOf Tpl
   */
  this.str = str
  /**
   * @description store the template data
   * @memberOf Tpl
   */
  this.data = data
  /**
   * @description new and store an instance of Complier
   * @memberOf Tpl
   */
  this.compiler = new Compiler()
}

/**
 * @description The method to parse the html string
 * @for Tpl
 * @method
 * @param { string } [str=this.str]
 * @return { Tpl }
 */
Tpl.prototype.parse = function (str) {
  this._ast = this.compiler.parse(str || this.str)
  return this
}

/**
 * @description The method to render the ast
 * @for Tpl
 * @param { object } [obj]
 * obj: {
 *    ast: [] // your own ast
 *    data: [] // the template data
 * }
 * @return { Tpl }
 * @example
 * // you can use variable to render html string via "{{}}" and data
 * var tpl = new Tpl()
 *  var data = {
 *      divClass: 'div',
 *      out: 'outer'
 *  }
 *  var htmlString = `
      <div class="{{ divClass }}">
          <p>{{ "inner" }}</p>
      </div>
      <p>{{ out + "p" }}</p>
   `
 *  var dom = tpl.parse(htmlString).render({ data: data }).getDom()
 *  //
 *  // dom is:
 *  // [
 *  //  <div class="div">
 *  //      <p>inner</p>
 *  //  </div>,
 *  //  <p>outerp</p>
 *  // ]
 *  //
 */
Tpl.prototype.render = function (obj) {
  this._dom = this.compiler.render(obj.ast || this._ast, obj.data || this.data)
  return this
}

/**
 * @description Use this method you can override the function of Renderer
 * @for Tpl
 * @param { string } name the property of Render
 * @param { function } func the function
 * @return { Tpl }
 */
Tpl.prototype.overrideRender = function (name, func) {
  this.compiler.overrideRender(name, func)
  return this
}

/**
 * @description Get the ast of Tpl after parsing
 * @for Tpl
 * @return { array }
 * // The format of ast is:
 * [
 *  {
 *    type: 'tag',
 *    tag: 'div',
 *    attrs: {
 *      class: 'container'
 *    }
 *    children: [
 *      // text node
 *      {
 *        type: 'text',
 *        text: 'This is a text node'
 *      },
 *      // comment node
 *      {
 *        type: 'note',
 *        note: 'This is a comment node'
 *      }
 *    ]
 *  },
 *  {
 *    type: 'tag',
 *    tag: 'p',
 *    children: [
 *      {
 *        type: 'text',
 *        text: 'This is the text inner p element'
 *      }
 *    ]
 *  }
 * ]
 * // It stands for:
 * <div class="container">This is a text node<!--This is a comment node--></div>
 * <p>This is the text inner p element</p>
 */
Tpl.prototype.getAst = function () {
  return this._ast
}

/**
 * @description Get the dom array after render
 * @return {Array}
 * // For example:
 * [
 *  <div></div>,
 *  <p></p>
 * ]
 */
Tpl.prototype.getDom = function () {
  return this._dom
}

export default Tpl
