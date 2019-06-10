# Fontend-tpl
This is a simple fontend template engine

# Language
English || [中文](./lang/zh-CN.md)

# Usage
### Browser
```html
<script src="dist/tpl.js"></script>
<!--
    If it work in prodution, you may use the following instead:
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
// some code as above
```
> Attention  
If you want to use it in node environment, you should offer a environment of DOM.  
For example, you can use the jsdom module.

## Tests
You can download this depository and run `npm test` to see the unit test. 

# Docs
If you want to get more information, please see [API Document](https://maoyonglong.github.io/frontend-tpl/)