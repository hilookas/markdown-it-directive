'use strict';

const MarkdownIt = require('markdown-it');
const directivePlugin = require('.');

function assert(condition) {
  if (!condition) {
    throw new Error();
  }
}

function test() {
  for (const case_ of cases) {
    case_[1]()
  }
  console.info('OK.')
}

const cases = [
  [ 'case1', () => {
    const md = (new MarkdownIt())
      .use(directivePlugin)
      .use((md) => {
        md.inlineDirectives['aaa'] = ({state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd}) => {
          const token = state.push('html_inline', '', 0);
          token.content = JSON.stringify({ directive: 'aaa', content, dests, attrs });
        };
        md.inlineDirectives['a-a'] = ({state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd}) => {
          const token = state.push('html_inline', '', 0);
          token.content = JSON.stringify({ directive: 'a-a', content, dests, attrs });
        };
        md.inlineDirectives['a_a'] = ({state, content, dests, attrs}) => {
          const token = state.push('html_inline', '', 0);
          token.content = JSON.stringify({ directive: 'a_a', content, dests, attrs });
        };
        md.inlineDirectives['bbb'] = ({state, content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd}) => {
          const token = state.push('html_inline', '', 0);
          token.content = JSON.stringify({ directive: 'bbb', content, dests, attrs, contentStart, contentEnd, directiveStart, directiveEnd });
        };

        md.blockDirectives['aaa'] = ({
          state, content, contentTitle, inlineContent, dests, attrs,
          directiveStartLine, directiveEndLine
        }) => {
          const token = state.push('html_block', '', 0);
          token.map = [ directiveStartLine, directiveEndLine ];
          token.content = JSON.stringify({
            directive: 'aaa(B)', content, contentTitle, inlineContent, dests, attrs,
          });
        };

        md.blockDirectives['c-c'] = ({
          state, content, contentTitle, inlineContent, dests, attrs,
          directiveStartLine, directiveEndLine
        }) => {
          const token = state.push('html_block', '', 0);
          token.map = [ directiveStartLine, directiveEndLine ];
          token.content = JSON.stringify({
            directive: 'c-c', content, contentTitle, inlineContent, dests, attrs,
          });
        };

        md.blockDirectives['a'] = ({
          state, content, contentTitle, inlineContent, dests, attrs,
          directiveStartLine, directiveEndLine
        }) => {
          const token = state.push('html_block', '', 0);
          token.map = [ directiveStartLine, directiveEndLine ];
          token.content = JSON.stringify({
            directive: 'a', content, contentTitle, inlineContent, dests, attrs
          });
        };

        md.blockDirectives['bbb'] = ({
          state, content, contentTitle, inlineContent, dests, attrs,
          contentStartLine, contentEndLine,
          contentTitleStart, contentTitleEnd,
          inlineContentStart, inlineContentEnd,
          directiveStartLine, directiveEndLine
        }) => {
          const token = state.push('html_block', '', 0);
          token.map = [ directiveStartLine, directiveEndLine ];
          token.content = JSON.stringify({
            directive: 'bbb(B)', content, contentTitle, inlineContent, dests, attrs,
            contentStartLine, contentEndLine,
            contentTitleStart, contentTitleEnd,
            inlineContentStart, inlineContentEnd,
            directiveStartLine, directiveEndLine
          });
        };
      });

    // Inline
    // ---------

    // should parse a full directive
    // should pair `[]` correct
    // should pair `()` correct
    // should indicate destination type
    // should recognize not surrounded attr value
    assert(
      md.renderInline(':aaa[1[2](3)4](a123 /c2/34 "vv43" <aaf2> \'aa1d\' (tt\\(tt)){a_fd=ff-f aa-a="aa14" .1cla-ss1 .cla--ss2 #ida1 #ida2}')
      ===
      '{"directive":"aaa","content":"1[2](3)4","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]}}'
    );

    // should ignore `a_a` directive (directive name normalize)
    // should recognize `\n` as attr kv spliter
    assert(
      md.renderInline(':aaa[1[2](3)4](a123 /c2/34 "vv43" <aaf2> \'aa1d\' (tt\\(tt)){a_fd=ff-f aa-a="aa14" .1cla-ss1 .cla--ss2 #ida1 #ida2}')
      ===
      '{"directive":"aaa","content":"1[2](3)4","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]}}'
    );

    // should not keep class and id array
    assert(
      md.renderInline(':aaa[]{}')
      ===
      '{"directive":"aaa","content":"","attrs":{}}'
    );

    // should pair `[]` correct
    assert(
      md.renderInline(':a_a[ a[a\na]a]a]{.cls233\n #4432  }')
      ===
      '{"directive":"a-a","content":" a[a\\na]a"}a]{.cls233\n#4432  }'
    );

    // should pair `()` correct
    assert(
      md.renderInline(':aaa[aaa]((\\(/aaa)))){}')
      ===
      '{"directive":"aaa","content":"aaa","dests":[["string","(/aaa"]]})){}'
    );

    // should escape `""`
    assert(
      md.renderInline(':aaa[1234]( a123 /c234 "vv43" <aaf2> ){aaadf="ff\\"aef" aaa="aa14" .class1 .class2 #id1}')
      ===
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]],"attrs":{"aaadf":"ff\\"aef","aaa":"aa14","class":["class1","class2"],"id":"id1"}}'
    );

    // should not allow space between inline directive parts
    assert(
      md.renderInline(':aaa[1234](a123 /c234 "vv43" <aaf2>) {aaadf="ffaef" aaa="aa14" .class1 .class2 #id1}')
      ===
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]]} {aaadf=&quot;ffaef&quot; aaa=&quot;aa14&quot; .class1 .class2 #id1}'
    );

    // should support multiple derective
    // should support no text label derective
    assert(
      md.renderInline(':aaa[1234](a123 /c234 "vv43" <aaf2> ){aaadf="ff\\"aef" aaa="aa14" .class1 .class2 #id1}:a-a :a_a[ aa\naa]{.cls233\n #4432  }')
      ===
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]],"attrs":{"aaadf":"ff\\"aef","aaa":"aa14","class":["class1","class2"],"id":"id1"}}{"directive":"a-a"} {"directive":"a-a","content":" aa\\naa","attrs":{"class":"cls233","id":"4432"}}'
    );

    // should support reference
    // should be able to ignore attrs
    assert(
      md.render(':aaa[a1234]:aaa[a1234][bcd12] :aaa[a1234]{a=1233}\n\n[a1234]: /aaaa "bbbb"\n[bcd12]: /a123 "b233"')
      ===
      '<p>{"directive":"aaa","content":"a1234","dests":[["link","/aaaa"],["string","bbbb"]]}{"directive":"aaa","content":"a1234","dests":[["link","/a123"],["string","b233"]]} {"directive":"aaa","content":"a1234","dests":[["link","/aaaa"],["string","bbbb"]],"attrs":{"a":"1233"}}</p>\n'
    );

    // should merge same attrs into an array
    assert(
      md.renderInline(':aaa[a1234]{a=123 a=233 b=092}')
      ===
      '{"directive":"aaa","content":"a1234","attrs":{"a":["123","233"],"b":"092"}}'
    );

    // should be able to pass accurate pos
    // should be able to be parsed in other components of markdown
    assert(
      md.renderInline('**hello world!**:bbb[a1123234]{a=123 a=233 b=092}:bbb[a1123234]{a=123 a=233 b=092}[aaa](666)')
      ===
      '<strong>hello world!</strong>{"directive":"bbb","content":"a1123234","attrs":{"a":["123","233"],"b":"092"},"contentStart":21,"contentEnd":29,"directiveStart":16,"directiveEnd":49}{"directive":"bbb","content":"a1123234","attrs":{"a":["123","233"],"b":"092"},"contentStart":54,"contentEnd":62,"directiveStart":49,"directiveEnd":82}<a href="666">aaa</a>'
    );

    // should not cross two paragraph
    assert(
      md.render(':aaa[aaaa\n\n]')
      ===
      '<p>{"directive":"aaa"}[aaaa</p>\n<p>]</p>\n'
    );

    // should not parse wrong format destinations
    // should allow digital as first char of attr value
    assert(
      md.renderInline(':aaa[aaab]("aaaa"aaaa){a111=5555}')
      ===
      '{"directive":"aaa","content":"aaab"}(&quot;aaaa&quot;aaaa){a111=5555}'
    );

    // should not allow digital as first char of attr name
    assert(
      md.renderInline(':aaa[aaab]("aaaa" aaaa){1111=5555}')
      ===
      '{"directive":"aaa","content":"aaab","dests":[["string","aaaa"],["link","aaaa"]]}{1111=5555}'
    );

    // should not parse unregisted directive
    assert(
      md.renderInline(':a1f[aaab]("aaaa" aaaa){a111=5555}')
      ===
      ':a1f[aaab](&quot;aaaa&quot; aaaa){a111=5555}'
    );



    // Block
    // ---------

    // should not treat as block directive
    assert(
      md.render(':a')
      ===
      '<p>:a</p>\n'
    );

    // should treat as block directive
    assert(
      md.render('::a')
      ===
      '{"directive":"a","contentTitle":""}'
    );

    // should treate this as a inline directive
    assert(
      md.render(':::aaa[](){}   ')
      ===
      '<p>::{"directive":"aaa","content":"","dests":[],"attrs":{}}</p>\n'
    );

    // should parse a full directive
    // should pair `[]` correct
    // should pair `()` correct
    // should indicate destination type
    // should recognize not surrounded attr value
    // should pair ::: correct
    assert(
      md.render(`2333

:::: bbb [1[2](3)45\\]5] (a123 /c2/34 "vv43" <aaf2> 'aa1d' (tt\\(tt)) {a_fd=ff-f aa-a="aa14" .1cla-ss1 .cla--ss2 #ida1 #ida2}  23333!JLJ:@@  :::
kjdfoqejfoijoivlwi1123124
:: 123notexist
:::    123notexist
:::
nextlineend
:::
:::
233444`)
      ===
      '<p>2333</p>\n{"directive":"bbb(B)","content":"kjdfoqejfoijoivlwi1123124\\n:: 123notexist\\n:::    123notexist\\n:::\\nnextlineend\\n","contentTitle":"23333!JLJ:@@","inlineContent":"1[2](3)45\\\\]5","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]},"contentStartLine":3,"contentEndLine":8,"contentTitleStart":131,"contentTitleEnd":143,"inlineContentStart":16,"inlineContentEnd":28,"directiveStartLine":2,"directiveEndLine":9}<p>:::\n233444</p>\n'
    );

    // should treat this like a link
    assert(
      md.render(':::  aaa [](){}       :::')
      ===
      '<p>:::  aaa <a href=""></a>{}       :::</p>\n'
    );

    // should treat this like text
    assert(
      md.render('12fe ::: aaa\n\n:::')
      ===
      '<p>12fe ::: aaa</p>\n<p>:::</p>\n'
    );

    // should calc contentTitleEnd correctly
    assert(
      md.render(':: bbb [] () {}    adsfjjl::kne')
      ===
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":31,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    // should ignore blank after contentTitleEnd
    assert(
      md.render(':: bbb [] () {}    adsfjjl::kne::     ')
      ===
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":31,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    // should treat single : at the end as a real :
    assert(
      md.render(':: bbb [] () {}    adsfjjl::kne:  ')
      ===
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne:","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":32,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    // should parse correctly (pos, empty content) at compat mode
    assert(
      md.render(`::bbb[](){}::
:::bbb[](){}
:::`)
      ===
      '{"directive":"bbb(B)","contentTitle":"","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":11,"contentTitleEnd":11,"inlineContentStart":6,"inlineContentEnd":6,"directiveStartLine":0,"directiveEndLine":1}{"directive":"bbb(B)","content":"","contentTitle":"","inlineContent":"","dests":[],"attrs":{},"contentStartLine":2,"contentEndLine":2,"contentTitleStart":26,"contentTitleEnd":26,"inlineContentStart":21,"inlineContentEnd":21,"directiveStartLine":1,"directiveEndLine":3}'
    );

    // should calc contentTitle pos right when there is no contentTitle
    assert(
      md.render(':: bbb[aaaa]    ::')
      ===
      '{"directive":"bbb(B)","contentTitle":"","inlineContent":"aaaa","contentTitleStart":16,"contentTitleEnd":16,"inlineContentStart":7,"inlineContentEnd":11,"directiveStartLine":0,"directiveEndLine":1}'
    );

    // should parse right with single char directive name
    // should not mix inlineDirective and blockDirective
    assert(
      md.render(':a[]\n\n::a')
      ===
      '<p>:a[]</p>\n{"directive":"a","contentTitle":""}'
    );

    // should get along well with blockquote
    assert(
      md.render(`> :::aaa [5542] (/aaa) {.cls}
>  text
:::`)
      ===
      '<blockquote>\n{"directive":"aaa(B)","content":" text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}</blockquote>\n'
    );

    // should remove indent blanks correctly
    assert(
      md.render(`  :::aaa [5542] (/aaa) {.cls}
    >  text
    :::`)
      ===
      '{"directive":"aaa(B)","content":"  >  text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}'
    );
    assert(
      md.render(`   :::aaa [5542] (/aaa) {.cls}
  >  text
  :::`)
      ===
      '{"directive":"aaa(B)","content":">  text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}'
    );
    // should correct parse inline directive markup without content and dests, while the markdown markup contains references
    assert(
      md.render(`:dir

  [ref]: https://example.com/`)
      ===
      '<p>:dir</p>\n'
    )
  } ],
];

test();
