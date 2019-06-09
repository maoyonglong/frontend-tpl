function render (ast) {
  let nodes = []
  ast.forEach((astNode) => {
    let node = null
    let type = astNode.type
    if (type === 'text') {
      node = document.createTextNode(astNode.text)
      this.handleTextNode(node, astNode)
    } else if (type === 'note') {
      node = document.createComment(astNode.note)
      this.handleNoteNode(node, astNode)
    } else if (type === 'tag') {
      node = document.createElement(astNode.tag)
      this.handleTagNode(node, astNode)
    }
    if (astNode.children) {
      let children = render.call(this, astNode.children)
      children.forEach(child => {
        node.appendChild(child)
      })
    }
    nodes.push(node)
  })
  return nodes
}

function Render () {}

Render.prototype.render = render
Render.prototype.handleTextNode = function (node, astNode) {

}
Render.prototype.handleNoteNode = function (node, astNode) {

}
Render.prototype.handleTagNode = function (node, astNode) {
  let attrs = astNode.attrs
  if (attrs) {
    for (let attrKey in attrs) {
      node.setAttribute(attrKey, attrs[attrKey])
    }
  }
}

export default Render
