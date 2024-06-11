# markdown-it-directive

[中文指南](README.zh.md)

Directive extension for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser. Make your Markdown great again!

Basically follow [Generic directives/plugins syntax spec](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) on CommonMark Community and compatable with [markdown-it-container](https://github.com/markdown-it/markdown-it-container).

Recommended for using with [markdown-it-directive-webcomponents](https://github.com/hilookas/markdown-it-directive-webcomponents).

## Install

`npm i markdown-it-directive`

## Required dependencies

Please note that to start using the package, your project must also have the following installed: `markdown-it`, `@types/markdown-it`. Check out the `peerDependencies` section of `package.json` for accurate information.

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

markdown-it-directive plugin only extracts valid directive from the markdown document, and passes it to the corresponding registered `handler` for further processing.

There are two types of directive and `handler`, inline level and block level.

After loading this plugin, two arrays `inlineDirectives` and` blockDirectives` will be added to the `md` instance for registering inline level and block level `handler`, and it will add `inline_directive` and `block_directive` rules to `block ruler` and `inline ruler` to extract directive from the document.

Here are three directive formats that can be recognized:

```text
text before :directive-name[content](/link "destination" /another "one"){.class #id name=value name="string!"} text after

:: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::

::: directive-name [inline content] (/link "destination" /another "one") {.class #id name=value name="string!"} content title ::
content
:::
```

The name of the `handler`, which is the key of the array, only allows lowercase letters and `-`, the directive name in the document is case-insensitive, and all `_` will be converted into `-` to find the corresponding `handler`.

`handler` will receive the parsed link destinations (ie those in `()`) (ie `dests`), attributes (ie `attrs`), not unescaped `content` and the position of each component of the directive, and needs to store processed things in the MarkdownIt Token stream. Full details can be found in [markdown-it-directive-webcomponents] (https://github.com/hilookas/markdown-it-directive-webcomponents).

## Example

```javascript
const md = require('markdown-it')()
  .use(require('markdown-it-directive'))
  .use((md) => {
    md.inlineDirectives['directive-name'] = (state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd) => {
      const token = state.push('html_inline', '', 0);
      token.content = JSON.stringify({ directive: 'directive-name', content, dests, attrs }) + '\n';
    };

    md.blockDirectives['directive-name'] = (
      state, content, contentTitle, inlineContent, dests, attrs,
      contentStartLine, contentEndLine,
      contentTitleStart, contentTitleEnd,
      inlineContentStart, inlineContentEnd,
      directiveStartLine, directiveEndLine
    ) => {
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

More examples can be found in `test.js`.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020, lookas