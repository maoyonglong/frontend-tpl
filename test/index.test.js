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

test('single: render text node', () => {
  let nodes = tpl.render([{
    type: 'text',
    text: 'test'
  }])._dom
  console.log(nodes)
  expect(nodes[0].nodeValue).toBe('test')
})
