# markdown-it-directive

[markdown-it](https://github.com/markdown-it/markdown-it) 解析器的指令拓展。让你的 Markdown 变得强大起来！

基本上遵从 [一般指令/插件语法标准](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) 并且与 [markdown-it-container](https://github.com/markdown-it/markdown-it-container) 兼容。

推荐与 [markdown-it-directive-webcomponents](https://github.com/hilookas/markdown-it-directive-webcomponents) 一起使用。

## 安装

`npm i markdown-it-directive`

## 所需依赖

需要提前安装 `markdown-it`, `@types/markdown-it` ，详情参见 `package.json` 中的 `peerDependencies` 部分。

## API

```javascript
const md = require('markdown-it')()
  .use(require('markdown-it-directive'))
  .use((md) => {
    md.inlineDirectives['aaa'] = ({state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd}) => {
      //
    };

    md.blockDirectives['aaa'] = ({
      state, content, contentTitle, inlineContent, dests, attrs,
      contentStartLine, contentEndLine,
      contentTitleStart, contentTitleEnd,
      inlineContentStart, inlineContentEnd,
      directiveStartLine, directiveEndLine
    }) => {
      //
    };
  });
```

markdown-it-directive 插件仅仅从 markdown 文档中提取出符合规则的指令 ，并且将其传到相应的注册过的 `handler` 中进行处理。

指令和 `handler` 分为两种，一种是内联的，一种是块级的。

加载该插件后，会在 `md` 实例对象上添加两个数组 `inlineDirectives` 和 `blockDirectives` 用于注册内联和块级的 `handler` ，并且在 `block ruler` 和 `inline ruler` 上分别添加 `inline_directive` 和 `block_directive `规则用于从文档中提取指令。

以下是三种可以被识别的指令格式：

```text
text before :directive-name[content](/link "destination" /another "one"){.class #id name=value name="string!"} text after

:: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::

::: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::
content
:::
```

`handler` 的名称，即数组的键名，仅仅允许小写字母和 `-`，文档中指令名不区分大小写，且所有的 `_` 会被转换成 `-` 来查找对应的 `handler`。

`handler` 需要接收已经解析过的 link destinations （即括号中的那些）（即 `dests`）， attributes （即 `attrs`），未反转义的 `content` 以及指令的各个组件的位置，并且将处理后的内容添加到 MarkdownIt Token 流中。具体处理过程可以参见 [markdown-it-directive-webcomponents](https://github.com/hilookas/markdown-it-directive-webcomponents) 代码。

## 样例

```javascript
const md = require('markdown-it')()
  .use(require('markdown-it-directive'))
  .use((md) => {
    md.inlineDirectives['directive-name'] = ({state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd}) => {
      const token = state.push('html_inline', '', 0);
      token.content = JSON.stringify({ directive: 'directive-name', content, dests, attrs }) + '\n';
    };

    md.blockDirectives['directive-name'] = ({
      state, content, contentTitle, inlineContent, dests, attrs,
      contentStartLine, contentEndLine,
      contentTitleStart, contentTitleEnd,
      inlineContentStart, inlineContentEnd,
      directiveStartLine, directiveEndLine
    }) => {
      const token = state.push('html_block', '', 0);
      token.map = [ directiveStartLine, directiveEndLine ];
      token.content = JSON.stringify({
        directive: 'directive-name (block)', content, contentTitle, inlineContent, dests, attrs,
      }) + '\n';
    };
  });

console.dir(md.render(`text before :directive-name[content](/link "destination" /another "one"){.class #id name=value name="string!"} text after

:: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::

::: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::
content
:::`));

/* output

<p>text before {"directive":"directive-name","content":"content","dests":[["link","/link"],["string","destination"],["link","/another"],["string","one"]],"attrs":{"class":"class","id":"id","name":["value","string!"]}}
 text after</p>
{"directive":"directive-name (block)","contentTitle":"content title","inlineContent":"inline content","dests":[["link","/link"],["string","destination"],["link","/another"],["string","one"]],"attrs":{"class":"class","id":"id","name":["value","string!"]}}
{"directive":"directive-name (block)","content":"content\n","contentTitle":"content title","inlineContent":"inline content","dests":[["link","/link"],["string","destination"],["link","/another"],["string","one"]],"attrs":{"class":"class","id":"id","name":["value","string!"]}}

*/
```

更多样例可以参见 `test.js` 文件。

## 协议

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020, lookas