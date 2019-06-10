'use strict';

var INIT = 0; // 初始状态

var LEFT_TAG_START = 1; // 左标签的开始符号状态

var LEFT_TAG = 2; // 左标签名字状态

var LEFT_TAG_IN = 3; // 左标签里面状态

var LEFT_TAG_SLASH = 4; // 左标签斜杠

var LEFT_TAG_END = 5; // 左标签结束状态

var RIGHT_TAG_START = 6; // 右标签开始符号状态

var RIGHT_TAG = 7; // 右标签名字状态

var RIGHT_TAG_SLASH = 8; // 右标签斜杆状态

var RIGHT_TAG_END = 9; // 右标签结束状态

var TEXT = 10; // 文本状态

var ATTR_KEY = 11; // 属性名状态

var ATTR_SPACE = 12; // 属性空格状态

var ATTR_EQUAL = 13; // 属性等于号状态

var ATTR_VAL = 14; // 属性值状态

var NOTE_START = 15; // 注释开始状态

var NOTE_HYPHEN = 16; // 注释短横线状态

var NOTE_IN = 17; // 注释里面状态

var NOTE_END = 18; // 注释结束状态
// 当前已有的标签名

var Tag = {
  // 单标签
  single: ['input', 'img', 'br', 'hr', 'link', 'meta'],
  // // 双标签
  // double: [
  //   'div',
  //   'span',
  //   'ul',
  //   'li',
  //   'ol',
  //   'a',
  //   'i',
  //   'b',
  //   'p',
  //   'header',
  //   'aside'
  // ],
  isSingle: function isSingle(tag) {
    return this.single.indexOf(tag) >= 0;
  },
  isDouble: function isDouble(tag) {
    return this.single.indexOf(tag) < 0;
  }
}; // 跳转时的判断条件

var Condition = {
  // 是否是字母
  isLetter: function isLetter(ch) {
    return /[a-zA-Z]/.test(ch);
  },
  // 是否是小于号
  isLg: function isLg(ch) {
    return ch === '<';
  },
  // 是否是大于号
  isGt: function isGt(ch) {
    return ch === '>';
  },
  // 是否是感叹号
  isExclamatory: function isExclamatory(ch) {
    return ch === '!';
  },
  // 是否是短横线
  isHyphen: function isHyphen(ch) {
    return ch === '-';
  },
  // 是否是斜杠
  isSlash: function isSlash(ch) {
    return ch === '/';
  },
  // 是否是空格
  isSpace: function isSpace(ch) {
    return ch === ' ';
  },
  // 是否是等于号
  isEqual: function isEqual(ch) {
    return ch === '=';
  },
  // 是否是单引号
  isSingleQuote: function isSingleQuote(ch) {
    return ch === "'";
  },
  // 是否是双引号
  isDoubleQuote: function isDoubleQuote(ch) {
    return ch === '"';
  },
  // 是否是引号
  isQuote: function isQuote(ch) {
    return this.isSingleQuote(ch) || this.isDoubleQuote(ch);
  }
};

function parse(str) {
  var isRoot = this.p === 0;
  var state = INIT; // 初始状态

  var nodes = []; // 该层结点数组

  var curNode; // 当前结点

  var tag = ''; // 暂存标签名

  var key = ''; // 暂存属性名

  var val = ''; // 暂存属性值

  var text = ''; // 暂存文本值

  var note = ''; // 暂存注释值

  var quote = ''; // 暂存引号

  var hyphenDirection = ''; // 暂存注释横线方向（左右）

  var tmp = ''; // 暂存值

  this.len = str.length;

  while (this.p < this.len) {
    // console.log(p, len, state)
    // 有穷自动机逻辑
    var ch = str.charAt(this.p); // 当前字符

    switch (state) {
      case INIT:
        // 新建结点对象
        curNode = {};
        nodes.push(curNode);

        if (Condition.isLg(ch)) {
          state = LEFT_TAG_START;
          tmp = ch;
        } else {
          state = TEXT;
          curNode.type = 'text';
          text = ch;
        }

        this.p++;
        continue;

      case LEFT_TAG_START:
        if (Condition.isExclamatory(ch)) {
          state = NOTE_START;
        } else if (Condition.isLetter(ch)) {
          state = LEFT_TAG;
          curNode.type = 'tag';
          tag = ch;
        } else if (Condition.isSpace(ch)) {
          state = TEXT;
          curNode.type = 'text';
          text = tmp + ch;
          tmp = '';
        } else {
          if (isRoot) {
            throw new Error("The tag name is illegal in ".concat(this.p, "."));
          } else {
            this.p--;
            nodes.pop();
            return nodes;
          }
        }

        this.p++;
        continue;

      case LEFT_TAG:
        if (Condition.isLetter(ch)) {
          tag += ch;
        } else if (Condition.isSpace(ch)) {
          state = LEFT_TAG_IN;
          curNode.tag = tag;
        } else if (Condition.isGt(ch)) {
          state = LEFT_TAG_END;
          curNode.tag = tag;
        } else {
          throw new Error("The tag name is illegal in ".concat(this.p, "."));
        }

        this.p++;
        continue;

      case LEFT_TAG_IN:
        if (!Condition.isSlash(ch) && !Condition.isSpace(ch)) {
          state = ATTR_KEY;
          key = ch;
        }

        if (Condition.isSlash(ch)) {
          state = LEFT_TAG_SLASH;
          tmp = ch;
        }

        if (Condition.isGt(ch)) {
          state = LEFT_TAG_END;
        }

        this.p++;
        continue;

      case LEFT_TAG_SLASH:
        if (Condition.isGt(ch)) {
          state = LEFT_TAG_END;
        }

        this.p++;
        continue;

      case LEFT_TAG_END:
        if (Tag.isSingle(tag)) {
          state = INIT;
          tag = '';
          continue;
        } else if (Condition.isSlash(tmp)) {
          throw new Error("The ".concat(tag, " is not a single tag."));
        }

        if (Condition.isLg(ch)) {
          state = RIGHT_TAG_START;
          this.p++;
        } else {
          curNode.children = parse.call(this, str);
        }

        continue;

      case RIGHT_TAG_START:
        tmp = '';

        if (!Condition.isSlash(ch)) {
          this.p--;
          curNode.children = parse.call(this, str); // < / 会死循环 --> 跳过<

          this.p++;
        } else {
          state = RIGHT_TAG_SLASH;
          this.p++;
        }

        continue;

      case RIGHT_TAG_SLASH:
        if (Condition.isSpace(ch) || Condition.isGt(ch) || Condition.isSlash(ch)) {
          throw new Error("A letter is expected in ".concat(this.p, " but got ").concat(ch, "."));
        } else {
          state = RIGHT_TAG;
          tmp += ch;
          this.p++;
        }

        continue;

      case RIGHT_TAG:
        if (Condition.isSlash(ch)) {
          throw new Error("A letter is expected in ".concat(this.p, " but got ").concat(ch, "."));
        } else if (Condition.isGt(ch)) {
          state = RIGHT_TAG_END;
        } else {
          tmp += ch;
        }

        this.p++;
        continue;

      case RIGHT_TAG_END:
        if (tag !== tmp) {
          throw new Error("The tag name is not similar in ".concat(this.p - 1));
        }

        if (!Tag.isDouble(tag)) {
          throw new Error("The ".concat(tag, " is not a double tag in ").concat(this.p - 1));
        }

        tag = '';
        state = INIT;
        continue;

      case TEXT:
        if (!Condition.isLg(ch)) {
          text += ch;
          this.p++;
        } else {
          curNode.text = text.trim();

          if (curNode.text === '') {
            nodes.pop();
          }

          text = '';
          state = INIT;
        }

        continue;

      case ATTR_KEY:
        if (Condition.isSpace(ch)) {
          state = ATTR_SPACE;
        } else if (Condition.isEqual(ch)) {
          state = ATTR_EQUAL;
        } else {
          key += ch;
        }

        this.p++;
        continue;

      case ATTR_SPACE:
        if (!Condition.isSpace(ch) && !Condition.isEqual(ch)) {
          state = ATTR_KEY;
        }

        if (Condition.isEqual(ch)) {
          state = ATTR_EQUAL;
        }

        this.p++;
        continue;

      case ATTR_EQUAL:
        if (Condition.isQuote(ch)) {
          state = ATTR_VAL;
          quote = ch;
        }

        this.p++;
        continue;

      case ATTR_VAL:
        if (ch !== quote) {
          val += ch;
        } else {
          state = LEFT_TAG_IN;

          if (curNode.attrs === undefined) {
            curNode.attrs = {};
          }

          curNode.attrs[key] = val;
          val = '';
        }

        this.p++;
        continue;

      case NOTE_START:
        if (Condition.isHyphen(ch)) {
          curNode.type = 'note';
          state = NOTE_HYPHEN;
          hyphenDirection = 'left';
        } else {
          throw new Error("'-' is expected in ".concat(this.p, " but got ").concat(ch, "."));
        }

        this.p++;
        continue;

      case NOTE_HYPHEN:
        if (Condition.isHyphen(ch)) ; else if (Condition.isGt(ch)) {
          state = NOTE_END;
          tmp = ch;
        } else if (hyphenDirection === 'left') {
          state = NOTE_IN;
          note += ch;
        } else {
          throw new Error("'-' or '>' is expected in ".concat(this.p, " but got ").concat(ch, "."));
        }

        this.p++;
        continue;

      case NOTE_IN:
        if (Condition.isHyphen(ch)) {
          state = NOTE_HYPHEN;
          hyphenDirection = 'right';
        } else if (Condition.isGt(ch)) {
          throw new Error("'-' is expected in ".concat(this.p, " but got ").concat(ch, "."));
        } else {
          note += ch;
        }

        this.p++;
        continue;

      case NOTE_END:
        curNode.text = note;
        note = '';
        hyphenDirection = '';
        state = INIT;
        continue;
    }
  } // 添加上字符串末尾状态信息


  if (curNode.type === 'text') {
    curNode.text = text.trim();

    if (curNode.text === '') {
      nodes.pop();
    }
  }

  if (curNode.type === 'note') {
    curNode.note = note;
  } // 将p重置


  this.p = 0;
  return nodes;
}
/**
 * @class Parser
 */


function Parser() {
  this.p = 0; // 移动指针

  this.len = 0; // 字符串的长度
}
/**
 * @description parse the html string, defined in Parser.prototype
 * @for Parser
 * @param { string } str html string
 * @return { Array } ast
 */


Parser.prototype.parse = parse;

/**
 * @class Renderer
 */
function Renderer() {}

function render(ast, data) {
  var _this = this;

  var nodes = [];
  ast.forEach(function (astNode) {
    var node = null;
    var type = astNode.type;

    if (type === 'text') {
      node = document.createTextNode(astNode.text);

      _this.handleTextNode(node, astNode, data);
    } else if (type === 'note') {
      node = document.createComment(astNode.note);

      _this.handleNoteNode(node, astNode, data);
    } else if (type === 'tag') {
      node = document.createElement(astNode.tag);

      _this.handleTagNode(node, astNode, data);
    }

    if (astNode.children) {
      var children = render.call(_this, astNode.children, data);
      children.forEach(function (child) {
        node.appendChild(child);
      });
    }

    nodes.push(node);
  });
  return nodes;
}

function replaceMatchesWord(str, data) {
  var content = str.match(/\{\{(.*)\}\}/);

  if (content !== null) {
    return content[1].replace(/(?<=[{[,+-/*\s.])\w+(?=[+-/*\s.,}\]])/g, function (match, p1) {
      return data[match] ? "data.".concat(match) : match;
    });
  }
}

function myEval(expression) {
  var Fn = Function;
  return new Fn('return ' + expression)();
}
/**
 * @description Renderer the ast, defined in Renderer.prototype
 * @for Renderer
 * @method
 * @param { Array } ast the ast Array
 * @param { Object } data the template data
 * @return { Array } the dom Array
 */


Renderer.prototype.render = render;
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
  var text = astNode.text;
  node.nodeValue = myEval(replaceMatchesWord(text, data)) || text;
};
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
  var note = astNode.note;
  node.nodeValue = myEval(replaceMatchesWord(note, data)) || note;
};
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
  var attrs = astNode.attrs;

  if (attrs) {
    for (var attrKey in attrs) {
      var attr = attrs[attrKey];
      node.setAttribute(attrKey, myEval(replaceMatchesWord(attr, data)) || attr);
    }
  }
};

/**
 * @class Complier
 */

function Complier() {
  /**
   * @description an instance of Parser
   * @memberOf Complier
   */
  this.parser = new Parser();
  /**
   * @memberof Complier
   * @description an instance of Renderer
   */

  this.renderer = new Renderer();
}
/**
 * @description parse the html string
 * @for Complier
 * @param { string } str html string
 * @return { Array } ast
 */


Complier.prototype.parse = function (str) {
  return this.parser.parse(str);
};
/**
 * @description render the ast
 * @for Compiler
 * @param { Array } ast ast
 * @param { Object } data the template data
 */


Complier.prototype.render = function (ast, data) {
  return this.renderer.render(ast, data);
};
/**
 * @description override the function of Renderer
 * @param { string } name the function name
 * @param { function } func the function
 */


Complier.prototype.overrideRender = function (name, func) {
  Renderer.prototype[name] = func;
};

/**
 * @class Tpl
 * @param { string } [str] htmlString
 * @param { object } [data] the data in template
 */

function Tpl(str, data) {
  /**
   * @description store the html string
   * @memberOf Tpl
   */
  this.str = str;
  /**
   * @description store the template data
   * @memberOf Tpl
   */

  this.data = data;
  /**
   * @description new and store an instance of Complier
   * @memberOf Tpl
   */

  this.compiler = new Complier();
}
/**
 * @description The method to parse the html string
 * @for Tpl
 * @method
 * @param { string } [str=this.str]
 * @return { Tpl }
 */


Tpl.prototype.parse = function (str) {
  this._ast = this.compiler.parse(this.str || str);
  return this;
};
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
  this._dom = this.compiler.render(this._ast || obj.ast, this.data || obj.data);
  return this;
};
/**
 * @description Use this method you can override the function of Renderer
 * @for Tpl
 * @param { string } name the property of Render
 * @param { function } func the function
 * @return { Tpl }
 */


Tpl.prototype.overrideRender = function (name, func) {
  this.compiler.overrideRender(name, func);
  return this;
};
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
  return this._ast;
};
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
  return this._dom;
};

module.exports = Tpl;
