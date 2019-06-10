const Tpl = require('../lib/tpl')

const tpl = new Tpl()

// ---------------------------------------------------- Parser Tests

// single node tests
test('single: parse text node', () => {
  expect(tpl.parse('abcdefg')._ast).toEqual([
    {
      type: 'text',
      text: 'abcdefg'
    }
  ])
})
test('single: parse note tag', () => {
  expect(tpl.parse('<!-- this is a note -->')._ast).toEqual([
    {
      type: 'note',
      note: ' this is a note '
    }
  ])
})
test('single: parse single tag node without attrs', () => {
  expect(tpl.parse('<img />')._ast).toEqual([
    {
      type: 'tag',
      tag: 'img'
    }
  ])
})
test('single: parse single tag node with attrs', () => {
  expect(tpl.parse('<img src="http://test.com" title="abcdef" />')._ast).toEqual([
    {
      type: 'tag',
      tag: 'img',
      attrs: {
        src: 'http://test.com',
        title: 'abcdef'
      }
    }
  ])
})
test('single: parse double tag node without attrs', () => {
  expect(tpl.parse('<div></div>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div'
    }
  ])
})
test('single: parse double tag node with attrs', () => {
  expect(tpl.parse('<div class="test" style="color: red;"></div>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div',
      attrs: {
        class: 'test',
        style: 'color: red;'
      }
    }
  ])
})

// brother nodes test
test('brother: parse single tag node without attrs', () => {
  expect(tpl.parse('<img /><img />')._ast).toEqual([
    {
      type: 'tag',
      tag: 'img'
    },
    {
      type: 'tag',
      tag: 'img'
    }
  ])
})
test('brother: parse single tag node with attrs', () => {
  expect(tpl.parse('<img class="img" /><img class="img" />')._ast).toEqual([
    {
      type: 'tag',
      tag: 'img',
      attrs: {
        class: 'img'
      }
    },
    {
      type: 'tag',
      tag: 'img',
      attrs: {
        class: 'img'
      }
    }
  ])
})
test('brother: parse double tag node without attrs', () => {
  expect(tpl.parse('<div></div><p></p>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div'
    },
    {
      type: 'tag',
      tag: 'p'
    }
  ])
})
test('brother: parse double tag node with attrs', () => {
  expect(tpl.parse('<div class="div"></div><p class="p"></p>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div',
      attrs: {
        class: 'div'
      }
    },
    {
      type: 'tag',
      tag: 'p',
      attrs: {
        class: 'p'
      }
    }
  ])
})

// children nodes test
test('children: parse one layer', () => {
  expect(tpl.parse('<p>sdfsdf</p>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'p',
      children: [
        {
          type: 'text',
          text: 'sdfsdf'
        }
      ]
    }
  ])
  expect(tpl.parse('<div class="img-wrapper"><img class="img" /></div>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div',
      attrs: {
        class: 'img-wrapper'
      },
      children: [
        {
          type: 'tag',
          tag: 'img',
          attrs: {
            class: 'img'
          }
        }
      ]
    }
  ])
  expect(tpl.parse('<div class="wrapper">This is an image.<img class="img" /></div>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div',
      attrs: {
        class: 'wrapper'
      },
      children: [
        {
          type: 'text',
          text: 'This is an image.'
        },
        {
          type: 'tag',
          tag: 'img',
          attrs: {
            class: 'img'
          }
        }
      ]
    }
  ])
})
test('children: parse two layer', () => {
  expect(tpl.parse('<div><p>sdfsdfsdf</p></div>')._ast).toEqual([
    {
      type: 'tag',
      tag: 'div',
      children: [
        {
          type: 'tag',
          tag: 'p',
          children: [
            {
              type: 'text',
              text: 'sdfsdfsdf'
            }
          ]
        }
      ]
    }
  ])
})

// --------------------------------------------------------------- Renderer Tests

// single render text
test('single: render text node', () => {
  let nodes = tpl.render({
    ast: [{
      type: 'text',
      text: 'test'
    }]
  }).getDom()
  expect(nodes[0].nodeValue).toBe('test')
})
test('single: render note node', () => {
  let nodes = tpl.render({
    ast: [{
      type: 'note',
      note: 'This is a note'
    }]
  }).getDom()
  expect(nodes[0].nodeName).toBe('#comment')
  expect(nodes[0].nodeValue).toBe('This is a note')
})
test('single: render node with children and variables', () => {
  let nodes = tpl.render({
    ast: [{
      type: 'tag',
      tag: 'p',
      children: [
        {
          type: 'text',
          text: '{{ text }}'
        }
      ]
    }],
    data: {
      text: 'This is a text'
    }
  }).getDom()
  expect(nodes[0].childNodes[0].nodeValue).toBe('This is a text')
})

// border test
test('brother: render node with children and variables', () => {
  let nodes = tpl.render({
    ast: [{
      type: 'tag',
      tag: 'p',
      children: [
        {
          type: 'text',
          text: '{{ "text1: " + text }}'
        }
      ]
    }, {
      type: 'tag',
      tag: 'p',
      children: [
        {
          type: 'text',
          text: '{{ "text2: " + text }}'
        }
      ]
    }],
    data: {
      text: 'This is a text'
    }
  }).getDom()
  expect(nodes[0].childNodes[0].nodeValue).toBe('text1: This is a text')
  expect(nodes[1].childNodes[0].nodeValue).toBe('text2: This is a text')
})


// override function tests
test('override text node function', () => {
  let tpl = new Tpl()
  tpl.overrideRender('handleTextNode', (node, astNode, data) => {
    node.nodeValue = 'handleTextNode: ' + astNode.text
  })
  let nodes = tpl.render({
    ast: [{
      type: 'text',
      text: 'sdfsdf'
    }]
  }).getDom()
  expect(nodes[0].nodeValue).toBe('handleTextNode: sdfsdf')
})

test('override note node function', () => {
  let tpl = new Tpl()
  tpl.overrideRender('handleNoteNode', (node, astNode, data) => {
    node.nodeValue = 'handleNoteNode: ' + astNode.note
  })
  let nodes = tpl.render({
    ast: [{
      type: 'note',
      note: 'sdfsdf'
    }]
  }).getDom()
  expect(nodes[0].nodeValue).toBe('handleNoteNode: sdfsdf')
})

test('override tag node function', () => {
  let tpl = new Tpl()
  tpl.overrideRender('handleTagNode', (node, astNode, data) => {
    node.className = data.prefix + astNode.tag
  })
  let nodes = tpl.render({
    ast: [{
      type: 'tag',
      tag: 'p'
    }],
    data: {
      prefix: 'handleTag-'
    }
  }).getDom()
  expect(nodes[0].className).toBe('handleTag-p')
})