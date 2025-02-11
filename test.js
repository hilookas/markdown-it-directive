'use strict';

const MarkdownIt = require('markdown-it');
const directivePlugin = require('.');

function assert(description, received, expected) {
  const condition = received === expected;
  if (!condition) {
    const descriptions = Array.isArray(description) ? description : [description];
    descriptions.forEach(desc => console.log(desc));
    console.log('');
    console.log('received', received);
    console.log('expected', expected);
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

    assert(
      [
        'should parse a full directive',
        'should pair `[]` correct',
        'should pair `()` correct',
        'should indicate destination type',
        'should recognize not surrounded attr value',
      ],
      md.renderInline(':aaa[1[2](3)4](a123 /c2/34 "vv43" <aaf2> \'aa1d\' (tt\\(tt)){a_fd=ff-f aa-a="aa14" .1cla-ss1 .cla--ss2 #ida1 #ida2}')
      ,
      '{"directive":"aaa","content":"1[2](3)4","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]}}'
    );

    assert(
      [
        'should ignore `a_a` directive (directive name normalize)',
        'should recognize `\n` as attr kv spliter'
      ],
      md.renderInline(':aaa[1[2](3)4](a123 /c2/34 "vv43" <aaf2> \'aa1d\' (tt\\(tt)){a_fd=ff-f aa-a="aa14" .1cla-ss1 .cla--ss2 #ida1 #ida2}')
      ,
      '{"directive":"aaa","content":"1[2](3)4","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]}}'
    );

    assert(
      'should not keep class and id array',
      md.renderInline(':aaa[]{}')
      ,
      '{"directive":"aaa","content":"","attrs":{}}'
    );

    assert(
      'should pair `[]` correct',
      md.renderInline(':a_a[ a[a\na]a]a]{.cls233\n #4432  }')
      ,
      '{"directive":"a-a","content":" a[a\\na]a"}a]{.cls233\n#4432  }'
    );

    (
      'should pair `()` correct',
      md.renderInline(':aaa[aaa]((\\(/aaa)))){}')
      ,
      '{"directive":"aaa","content":"aaa","dests":[["string","(/aaa"]]})){}'
    );

    assert(
      '`""`',
      md.renderInline(':aaa[1234]( a123 /c234 "vv43" <aaf2> ){aaadf="ff\\"aef" aaa="aa14" .class1 .class2 #id1}')
      ,
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]],"attrs":{"aaadf":"ff\\"aef","aaa":"aa14","class":["class1","class2"],"id":"id1"}}'
    );

    assert(
      'should not allow space between inline directive parts',
      md.renderInline(':aaa[1234](a123 /c234 "vv43" <aaf2>) {aaadf="ffaef" aaa="aa14" .class1 .class2 #id1}')
      ,
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]]} {aaadf=&quot;ffaef&quot; aaa=&quot;aa14&quot; .class1 .class2 #id1}'
    );

    assert(
      [
        'should support multiple derective',
        'should support no text label derective'
      ],
      md.renderInline(':aaa[1234](a123 /c234 "vv43" <aaf2> ){aaadf="ff\\"aef" aaa="aa14" .class1 .class2 #id1}:a-a :a_a[ aa\naa]{.cls233\n #4432  }')
      ,
      '{"directive":"aaa","content":"1234","dests":[["link","a123"],["link","/c234"],["string","vv43"],["link","aaf2"]],"attrs":{"aaadf":"ff\\"aef","aaa":"aa14","class":["class1","class2"],"id":"id1"}}{"directive":"a-a"} {"directive":"a-a","content":" aa\\naa","attrs":{"class":"cls233","id":"4432"}}'
    );

    assert(
      [
        'should support reference',
        'should be able to ignore attrs'
      ],
      md.render(':aaa[a1234]:aaa[a1234][bcd12] :aaa[a1234]{a=1233}\n\n[a1234]: /aaaa "bbbb"\n[bcd12]: /a123 "b233"')
      ,
      '<p>{"directive":"aaa","content":"a1234","dests":[["link","/aaaa"],["string","bbbb"]]}{"directive":"aaa","content":"a1234","dests":[["link","/a123"],["string","b233"]]} {"directive":"aaa","content":"a1234","dests":[["link","/aaaa"],["string","bbbb"]],"attrs":{"a":"1233"}}</p>\n'
    );

    assert(
      'should merge same attrs into an array',
      md.renderInline(':aaa[a1234]{a=123 a=233 b=092}')
      ,
      '{"directive":"aaa","content":"a1234","attrs":{"a":["123","233"],"b":"092"}}'
    );

    assert(
      [
        'should be able to pass accurate pos',
        'should be able to be parsed in other components of markdown'
      ],
      md.renderInline('**hello world!**:bbb[a1123234]{a=123 a=233 b=092}:bbb[a1123234]{a=123 a=233 b=092}[aaa](666)')
      ,
      '<strong>hello world!</strong>{"directive":"bbb","content":"a1123234","attrs":{"a":["123","233"],"b":"092"},"contentStart":21,"contentEnd":29,"directiveStart":16,"directiveEnd":49}{"directive":"bbb","content":"a1123234","attrs":{"a":["123","233"],"b":"092"},"contentStart":54,"contentEnd":62,"directiveStart":49,"directiveEnd":82}<a href="666">aaa</a>'
    );

    assert(
      'should not cross two paragraph',
      md.render(':aaa[aaaa\n\n]')
      ,
      '<p>{"directive":"aaa"}[aaaa</p>\n<p>]</p>\n'
    );

    assert(
      [
        'should not parse wrong format destinations',
        'should allow digital as first char of attr value',
      ],
      md.renderInline(':aaa[aaab]("aaaa"aaaa){a111=5555}')
      ,
      '{"directive":"aaa","content":"aaab"}(&quot;aaaa&quot;aaaa){a111=5555}'
    );

    assert(
      'should not allow digital as first char of attr name',
      md.renderInline(':aaa[aaab]("aaaa" aaaa){1111=5555}')
      ,
      '{"directive":"aaa","content":"aaab","dests":[["string","aaaa"],["link","aaaa"]]}{1111=5555}'
    );

    assert(
      'should not parse unregisted directive',
      md.renderInline(':a1f[aaab]("aaaa" aaaa){a111=5555}')
      ,
      ':a1f[aaab](&quot;aaaa&quot; aaaa){a111=5555}'
    );



    // Block
    // ---------

    assert(
      'should not treat as block directive',
      md.render(':a')
      ,
      '<p>:a</p>\n'
    );

    assert(
      'should treat as block directive',
      md.render('::a')
      ,
      '{"directive":"a","contentTitle":""}'
    );

    assert(
      'should treate this as a inline directive',
      md.render(':::aaa[](){}   ')
      ,
      '<p>::{"directive":"aaa","content":"","dests":[],"attrs":{}}</p>\n'
    );

    assert(
      [
        'should parse a full directive',
        'should pair `[]` correct',
        'should pair `()` correct',
        'should indicate destination type',
        'should recognize not surrounded attr value',
        'should pair ::: correct',
      ],
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
      ,
      '<p>2333</p>\n{"directive":"bbb(B)","content":"kjdfoqejfoijoivlwi1123124\\n:: 123notexist\\n:::    123notexist\\n:::\\nnextlineend\\n","contentTitle":"23333!JLJ:@@","inlineContent":"1[2](3)45\\\\]5","dests":[["link","a123"],["link","/c2/34"],["string","vv43"],["link","aaf2"],["string","aa1d"],["string","tt(tt"]],"attrs":{"a_fd":"ff-f","aa-a":"aa14","class":["1cla-ss1","cla--ss2"],"id":["ida1","ida2"]},"contentStartLine":3,"contentEndLine":8,"contentTitleStart":131,"contentTitleEnd":143,"inlineContentStart":16,"inlineContentEnd":28,"directiveStartLine":2,"directiveEndLine":9}<p>:::\n233444</p>\n'
    );

    assert(
      'should treat this like a link',
      md.render(':::  aaa [](){}       :::')
      ,
      '<p>:::  aaa <a href=""></a>{}       :::</p>\n'
    );

    assert(
      'should treat this like text',
      md.render('12fe ::: aaa\n\n:::')
      ,
      '<p>12fe ::: aaa</p>\n<p>:::</p>\n'
    );

    assert(
      'should calc contentTitleEnd correctly',
      md.render(':: bbb [] () {}    adsfjjl::kne')
      ,
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":31,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    assert(
      'should ignore blank after contentTitleEnd',
      md.render(':: bbb [] () {}    adsfjjl::kne::     ')
      ,
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":31,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    assert(
      'should treat single : at the end as a real :',
      md.render(':: bbb [] () {}    adsfjjl::kne:  ')
      ,
      '{"directive":"bbb(B)","contentTitle":"adsfjjl::kne:","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":19,"contentTitleEnd":32,"inlineContentStart":8,"inlineContentEnd":8,"directiveStartLine":0,"directiveEndLine":1}'
    );

    assert(
      'should parse correctly (pos, empty content) at compat mode',
      md.render(`::bbb[](){}::
:::bbb[](){}
:::`)
      ,
      '{"directive":"bbb(B)","contentTitle":"","inlineContent":"","dests":[],"attrs":{},"contentTitleStart":11,"contentTitleEnd":11,"inlineContentStart":6,"inlineContentEnd":6,"directiveStartLine":0,"directiveEndLine":1}{"directive":"bbb(B)","content":"","contentTitle":"","inlineContent":"","dests":[],"attrs":{},"contentStartLine":2,"contentEndLine":2,"contentTitleStart":26,"contentTitleEnd":26,"inlineContentStart":21,"inlineContentEnd":21,"directiveStartLine":1,"directiveEndLine":3}'
    );

    assert(
      'should calc contentTitle pos right when there is no contentTitle',
      md.render(':: bbb[aaaa]    ::')
      ,
      '{"directive":"bbb(B)","contentTitle":"","inlineContent":"aaaa","contentTitleStart":16,"contentTitleEnd":16,"inlineContentStart":7,"inlineContentEnd":11,"directiveStartLine":0,"directiveEndLine":1}'
    );

    assert(
      [
        'should parse right with single char directive name',
        'should not mix inlineDirective and blockDirective',
      ],
      md.render(':a[]\n\n::a')
      ,
      '<p>:a[]</p>\n{"directive":"a","contentTitle":""}'
    );

    assert(
      'should get along well with blockquote',
      md.render(`> :::aaa [5542] (/aaa) {.cls}
>  text
:::`)
      ,
      '<blockquote>\n{"directive":"aaa(B)","content":" text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}</blockquote>\n'
    );

    assert(
      'should remove indent blanks correctly',
      md.render(`  :::aaa [5542] (/aaa) {.cls}
    >  text
    :::`)
      ,
      '{"directive":"aaa(B)","content":"  >  text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}'
    );

    assert(
      'should remove indent blanks correctly with break',
      md.render(`   :::aaa [5542] (/aaa) {.cls}
  >  text
  :::`)
      ,
      '{"directive":"aaa(B)","content":">  text\\n","contentTitle":"","inlineContent":"5542","dests":[["link","/aaa"]],"attrs":{"class":"cls"}}'
    );

    assert(
      'should correct parse inline directive markup without content and dests, while the markdown markup contains references',
      md.render(`:dir

  [ref]: https://example.com/`)
      ,
      '<p>:dir</p>\n'
    );

    assert(
        'should parse block directive with content correctly',
        md.render(`:::  aaa
text
:::`)
        ,
        '{"directive":"aaa(B)","content":"text\\n","contentTitle":""}'
    );

    assert(
        'should parse block directive with content correctly with spaces',
        md.render(`:::  aaa
text
::: `)
        ,
        '{"directive":"aaa(B)","content":"text\\n","contentTitle":""}'
    );

  } ],
];

test();
