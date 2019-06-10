# Fontend-tpl
这是一个简单的前端模板引擎

# 语言
[English](../README.md) || 中文

# 用法
### 浏览器
```html
<script src="dist/tpl.js"></script>
<!--
    如果是生产环境，你可能需要换成以下文件：
    <script src="dist/tpl.bundle.js"></script>
-->
<script>
    var tpl = new Tpl()
    var data = {
        divClass: 'div',
        out: 'outer'
    }
    var htmlString = ' \
        <div class="{{ divClass }}"> \
            <p>{{ "inner" }}</p> \
        </div> \
        <p>{{ out + "p" }}</p> \
    '
    var dom = tpl.parse(htmlString).render({ data: data }).getDom()
    /**
     * dom is:
     * [
     *  <div class="div">
     *      <p>inner</p>
     *  </div>,
     *  <p>outerp</p>
     * ]
    */
</script>
```
### CommonJS
```js
var Tpl = require('frontend-tpl')
var tpl = new Tpl()
// 用法和上面一致
```
> 注意：  
如果你希望代码运行在Node环境，你需要提供一个DOM环境。比如，你可以引入jsdom模块。

## Tests
你可以下载该仓库，并运行`npm test`来查看单元测试结果。

# Docs
如果你希望获取更多信息，请看 [API Document](./docs/index.html)