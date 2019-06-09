(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Tpl = factory());
}(this, function () { 'use strict';

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
            curNode.text = text;
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


    if (text) {
      curNode.text = text;
    }

    if (note) {
      curNode.note = note;
    } // 将p重置


    this.p = 0;
    return nodes;
  }

  function Parser() {
    this.p = 0; // 移动指针

    this.len = 0; // 字符串的长度
  }

  Parser.prototype.parse = parse;

  function render(ast) {
    var _this = this;

    var nodes = [];
    ast.forEach(function (astNode) {
      var node = null;
      var type = astNode.type;

      if (type === 'text') {
        node = document.createTextNode(astNode.text);

        _this.handleTextNode(node, astNode);
      } else if (type === 'note') {
        node = document.createComment(astNode.note);

        _this.handleNoteNode(node, astNode);
      } else if (type === 'tag') {
        node = document.createElement(astNode.tag);

        _this.handleTagNode(node, astNode);
      }

      if (astNode.children) {
        var children = render.call(_this, astNode.children);
        children.forEach(function (child) {
          node.appendChild(child);
        });
      }

      nodes.push(node);
    });
    return nodes;
  }

  function Render() {}

  Render.prototype.render = render;

  Render.prototype.handleTextNode = function (node, astNode) {};

  Render.prototype.handleNoteNode = function (node, astNode) {};

  Render.prototype.handleTagNode = function (node, astNode) {
    var attrs = astNode.attrs;

    if (attrs) {
      for (var attrKey in attrs) {
        node.setAttribute(attrKey, attrs[attrKey]);
      }
    }
  };

  function Complier() {
    this.parser = new Parser();
    this.renderer = new Render();
  }

  Complier.prototype.parse = function (str) {
    return this.parser.parse(str);
  };

  Complier.prototype.render = function (ast) {
    return this.renderer.render(ast);
  };

  Complier.prototype.overrideRender = function (name, func) {
    Render.prototype[name] = func;
  };

  function Tpl(str) {
    this.str = str;
    this.compiler = new Complier();
  }

  Tpl.prototype.parse = function (str) {
    this._ast = this.compiler.parse(this.str || str);
    return this;
  };

  Tpl.prototype.render = function (ast) {
    this._dom = this.compiler.render(this._ast || ast);
    return this;
  };

  Tpl.prototype.overrideRender = function (name, func) {
    this.compiler.overrideRender(name, func);
  };

  return Tpl;

}));
