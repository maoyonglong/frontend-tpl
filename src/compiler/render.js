/**
 * @class Renderer
 */
function Renderer () {}

function render (ast, data) {
  let nodes = []
  ast.forEach((astNode) => {
    let node = null
    let type = astNode.type
    if (type === 'text') {
      node = document.createTextNode(astNode.text)
      this.handleTextNode(node, astNode, data)
    } else if (type === 'note') {
      node = document.createComment(astNode.note)
      this.handleNoteNode(node, astNode, data)
    } else if (type === 'tag') {
      node = document.createElement(astNode.tag)
      this.handleTagNode(node, astNode, data)
    }
    if (astNode.children) {
      let children = render.call(this, astNode.children, data)
      children.forEach(child => {
        node.appendChild(child)
      })
    }
    nodes.push(node)
  })
  return nodes
}

function replaceMatchesWord (str, data) {
  let content = str.match(/\{\{(.*)\}\}/)
  if (content !== null) {
    return content[1].replace(/(?<=[{[,+-/*\s.])\w+(?=[+-/*\s.,}\]])/g, (match, p1) => {
      return data[match] ? `data.${match}` : match
    })
  }
}

function myEval (expression, data) {
  var Fn = Function
  return new Fn('data', `return ${expression}`)(data)
}

/**
 * @description Renderer the ast, defined in Renderer.prototype
 * @for Renderer
 * @method
 * @param { Array } ast the ast Array
 * @param { Object } data the template data
 * @return { Array } the dom Array
 */
Renderer.prototype.render = render
/**
 * @description This is a callback to handle text node when Renderering,
 * override this function, you can handle text node as you like.
 * @param { obejct } node DOMElment || DOMNode
 * @param { object } astNode The ast expression of this node
 * @param { object } data the template data
 * @example
 * // you can use Tpl's overrideRenderer to override this function
 * var tpl = new Tpl('abcdefg', {
 *  textTip: 'text handle: '
 * })
 * tpl.overrideRenderer('handleTextNode', function (node, astNode, data) {
 *  let text = astNode.text
 *  node.nodeValue = data[textTip] + text
 * })
 * tpl.parse().Renderer().getDom()[0] // "text handle: abcdefg"
 */
Renderer.prototype.handleTextNode = function (node, astNode, data) {
  let text = astNode.text
  node.nodeValue = myEval(replaceMatchesWord(text, data), data) || text
}
/**
 * @description This is a callback to handle note node when Renderering,
 * override this function, you can handle note node as you like.
 * @param { obejct } node DOMElment || DOMNode
 * @param { object } astNode The ast expression of this node
 * @param { object } data the template data
 * @example
 * // the usage is simliar to handleTextNode
 */
Renderer.prototype.handleNoteNode = function (node, astNode, data) {
  let note = astNode.note
  node.nodeValue = myEval(replaceMatchesWord(note, data), data) || note
}
/**
 * @description This is a callback to handle tag node when Renderering,
 * override this function, you can handle tag node as you like.
 * @param { obejct } node DOMElment || DOMNode
 * @param { object } astNode The ast expression of this node
 * @param { object } data the template data
 * @example
 * // the usage is simliar to handleTextNode
 */
Renderer.prototype.handleTagNode = function (node, astNode, data) {
  let attrs = astNode.attrs
  if (attrs) {
    for (let attrKey in attrs) {
      let attr = attrs[attrKey]
      node.setAttribute(attrKey, myEval(replaceMatchesWord(attr, data), data) || attr)
    }
  }
}

export default Renderer
