const INIT = 0 // 初始状态
const LEFT_TAG_START = 1 // 左标签的开始符号状态
const LEFT_TAG = 2 // 左标签名字状态
const LEFT_TAG_IN = 3 // 左标签里面状态
const LEFT_TAG_SLASH = 4 // 左标签斜杠
const LEFT_TAG_END = 5 // 左标签结束状态
const RIGHT_TAG_START = 6 // 右标签开始符号状态
const RIGHT_TAG = 7 // 右标签名字状态
const RIGHT_TAG_SLASH = 8 // 右标签斜杆状态
const RIGHT_TAG_END = 9 // 右标签结束状态
const TEXT = 10 // 文本状态
const ATTR_KEY = 11 // 属性名状态
const ATTR_SPACE = 12 // 属性空格状态
const ATTR_EQUAL = 13 // 属性等于号状态
const ATTR_VAL = 14 // 属性值状态
const NOTE_START = 15 // 注释开始状态
const NOTE_HYPHEN = 16 // 注释短横线状态
const NOTE_IN = 17 // 注释里面状态
const NOTE_END = 18 // 注释结束状态

// 当前已有的标签名
const Tag = {
  // 单标签
  single: [
    'input',
    'img',
    'br',
    'hr',
    'link',
    'meta'
  ],
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
  isSingle (tag) {
    return this.single.indexOf(tag) >= 0
  },
  isDouble (tag) {
    return this.single.indexOf(tag) < 0
  }
}

// 跳转时的判断条件
const Condition = {
  // 是否是字母
  isLetter (ch) {
    return /[a-zA-Z]/.test(ch)
  },
  // 是否是小于号
  isLg (ch) {
    return ch === '<'
  },
  // 是否是大于号
  isGt (ch) {
    return ch === '>'
  },
  // 是否是感叹号
  isExclamatory (ch) {
    return ch === '!'
  },
  // 是否是短横线
  isHyphen (ch) {
    return ch === '-'
  },
  // 是否是斜杠
  isSlash (ch) {
    return ch === '/'
  },
  // 是否是空格
  isSpace (ch) {
    return ch === ' '
  },
  // 是否是等于号
  isEqual (ch) {
    return ch === '='
  },
  // 是否是单引号
  isSingleQuote (ch) {
    return ch === "'"
  },
  // 是否是双引号
  isDoubleQuote (ch) {
    return ch === '"'
  },
  // 是否是引号
  isQuote (ch) {
    return this.isSingleQuote(ch) || this.isDoubleQuote(ch)
  }
}

function parse (str) {
  let isRoot = this.p === 0
  let state = INIT // 初始状态
  let nodes = [] // 该层结点数组
  let curNode // 当前结点
  let tag = '' // 暂存标签名
  let key = '' // 暂存属性名
  let val = '' // 暂存属性值
  let text = '' // 暂存文本值
  let note = '' // 暂存注释值
  let quote = '' // 暂存引号
  let hyphenDirection = '' // 暂存注释横线方向（左右）
  let tmp = '' // 暂存值
  this.len = str.length
  while (this.p < this.len) {
    // console.log(p, len, state)
    // 有穷自动机逻辑
    let ch = str.charAt(this.p) // 当前字符
    switch (state) {
      case INIT:
        // 新建结点对象
        curNode = {}
        nodes.push(curNode)
        if (Condition.isLg(ch)) {
          state = LEFT_TAG_START
          tmp = ch
        } else {
          state = TEXT
          curNode.type = 'text'
          text = ch
        }
        this.p++
        continue
      case LEFT_TAG_START:
        if (Condition.isExclamatory(ch)) {
          state = NOTE_START
        } else if (Condition.isLetter(ch)) {
          state = LEFT_TAG
          curNode.type = 'tag'
          tag = ch
        } else if (Condition.isSpace(ch)) {
          state = TEXT
          curNode.type = 'text'
          text = tmp + ch
          tmp = ''
        } else {
          if (isRoot) {
            throw new Error(`The tag name is illegal in ${this.p}.`)
          } else {
            this.p--
            nodes.pop()
            return nodes
          }
        }
        this.p++
        continue
      case LEFT_TAG:
        if (Condition.isLetter(ch)) {
          tag += ch
        } else if (Condition.isSpace(ch)) {
          state = LEFT_TAG_IN
          curNode.tag = tag
        } else if (Condition.isGt(ch)) {
          state = LEFT_TAG_END
          curNode.tag = tag
        } else {
          throw new Error(`The tag name is illegal in ${this.p}.`)
        }
        this.p++
        continue
      case LEFT_TAG_IN:
        if (!Condition.isSlash(ch) && !Condition.isSpace(ch)) {
          state = ATTR_KEY
          key = ch
        }
        if (Condition.isSlash(ch)) {
          state = LEFT_TAG_SLASH
          tmp = ch
        }
        if (Condition.isGt(ch)) {
          state = LEFT_TAG_END
        }
        this.p++
        continue
      case LEFT_TAG_SLASH:
        if (Condition.isGt(ch)) {
          state = LEFT_TAG_END
        }
        this.p++
        continue
      case LEFT_TAG_END:
        if (Tag.isSingle(tag)) {
          state = INIT
          tag = ''
          continue
        } else if (Condition.isSlash(tmp)) {
          throw new Error(`The ${tag} is not a single tag.`)
        }
        if (Condition.isLg(ch)) {
          state = RIGHT_TAG_START
          this.p++
        } else {
          curNode.children = parse.call(this, str)
        }
        continue
      case RIGHT_TAG_START:
        tmp = ''
        if (!Condition.isSlash(ch)) {
          this.p--
          curNode.children = parse.call(this, str)
          // < / 会死循环 --> 跳过<
          this.p++
        } else {
          state = RIGHT_TAG_SLASH
          this.p++
        }
        continue
      case RIGHT_TAG_SLASH:
        if (Condition.isSpace(ch) || Condition.isGt(ch) || Condition.isSlash(ch)) {
          throw new Error(`A letter is expected in ${this.p} but got ${ch}.`)
        } else {
          state = RIGHT_TAG
          tmp += ch
          this.p++
        }
        continue
      case RIGHT_TAG:
        if (Condition.isSlash(ch)) {
          throw new Error(`A letter is expected in ${this.p} but got ${ch}.`)
        } else if (Condition.isGt(ch)) {
          state = RIGHT_TAG_END
        } else {
          tmp += ch
        }
        this.p++
        continue
      case RIGHT_TAG_END:
        if (tag !== tmp) {
          throw new Error(`The tag name is not similar in ${this.p - 1}`)
        }
        if (!Tag.isDouble(tag)) {
          throw new Error(`The ${tag} is not a double tag in ${this.p - 1}`)
        }
        tag = ''
        state = INIT
        continue
      case TEXT:
        if (!Condition.isLg(ch)) {
          text += ch
          this.p++
        } else {
          curNode.text = text
          text = ''
          state = INIT
        }
        continue
      case ATTR_KEY:
        if (Condition.isSpace(ch)) {
          state = ATTR_SPACE
        } else if (Condition.isEqual(ch)) {
          state = ATTR_EQUAL
        } else {
          key += ch
        }
        this.p++
        continue
      case ATTR_SPACE:
        if (!Condition.isSpace(ch) && !Condition.isEqual(ch)) {
          state = ATTR_KEY
        }
        if (Condition.isEqual(ch)) {
          state = ATTR_EQUAL
        }
        this.p++
        continue
      case ATTR_EQUAL:
        if (Condition.isQuote(ch)) {
          state = ATTR_VAL
          quote = ch
        }
        this.p++
        continue
      case ATTR_VAL:
        if (ch !== quote) {
          val += ch
        } else {
          state = LEFT_TAG_IN
          if (curNode.attrs === undefined) {
            curNode.attrs = {}
          }
          curNode.attrs[key] = val
          val = ''
        }
        this.p++
        continue
      case NOTE_START:
        if (Condition.isHyphen(ch)) {
          curNode.type = 'note'
          state = NOTE_HYPHEN
          hyphenDirection = 'left'
        } else {
          throw new Error(`'-' is expected in ${this.p} but got ${ch}.`)
        }
        this.p++
        continue
      case NOTE_HYPHEN:
        if (Condition.isHyphen(ch)) {
        } else if (Condition.isGt(ch)) {
          state = NOTE_END
          tmp = ch
        } else if (hyphenDirection === 'left') {
          state = NOTE_IN
          note += ch
        } else {
          throw new Error(`'-' or '>' is expected in ${this.p} but got ${ch}.`)
        }
        this.p++
        continue
      case NOTE_IN:
        if (Condition.isHyphen(ch)) {
          state = NOTE_HYPHEN
          hyphenDirection = 'right'
        } else if (Condition.isGt(ch)) {
          throw new Error(`'-' is expected in ${this.p} but got ${ch}.`)
        } else {
          note += ch
        }
        this.p++
        continue
      case NOTE_END:
        curNode.text = note
        note = ''
        hyphenDirection = ''
        state = INIT
        continue
    }
  }
  // 添加上字符串末尾状态信息
  if (text) {
    curNode.text = text
  }
  if (note) {
    curNode.note = note
  }
  // 将p重置
  this.p = 0

  return nodes
}

function Parser () {
  this.p = 0 // 移动指针
  this.len = 0 // 字符串的长度
}

Parser.prototype.parse = parse

export default Parser
