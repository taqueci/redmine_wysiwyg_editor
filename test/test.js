(function(root, factory) {
  if (typeof exports === 'object') {
    var rwe = require('../assets/javascripts/redmine_wysiwyg_editor.js');
    var assert = require('chai').assert;

    factory(false, rwe, assert);
  } else {
    factory(true, RedmineWysiwygEditor, chai.assert);
  }
}(this, function(isBrowser, RedmineWysiwygEditor, assert) {

suite('Redmine WYSIWYG Editor', function() {
  suite('Textile', function() {
    var x = new RedmineWysiwygEditor(null, null);

    x.setProject(1, 'gnr');
    x.setAttachments([{name: 'foo.png', id: 1},
                      {name: 'f o o.png', id: 2},
                      {name: 'フー.png', id: 3},
                      {name: '!&()+[].png', id: 4}]);

    test('Underline', function() {
      var content = '<span style="text-decoration: underline">Hello, world</span>';
      var expected = '+Hello, world+';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Underline with style attribute', function() {
      var content = '<span style="text-decoration: underline; color: white; background-color: #dc3545; opacity: 0.5; width: 100%;">Hello, world</span>';
      var expected = '+{background-color: #dc3545; color: white; width: 100%;}Hello, world+';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Line-through', function() {
      var content = '<span style="text-decoration: line-through">Hello, world</span>';
      var expected = '-Hello, world-';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Span', function() {
      var content = '<span>Hello, <span>world</span></span><span></span>';
      var expected = 'Hello, world';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Span with style attribute', function() {
      var content = '<span style="color: rgb(255, 255, 255); background-color: #dc3545"; opacity: 0.5; width: 100%">Hello, world</span>';
      var expected = '%{background-color: #dc3545; color: #ffffff;}Hello, world%';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Span with class attribute', function() {
      var content = '<span class="wiki-class-test another-class-test">Hello, world</span>';
      var expected = '%(test another-class-test)Hello, world%';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Span with class and style attributes', function() {
      var content = '<span class="wiki-class-test" style="color: rgb(255, 255, 255);">Hello, world</span>';
      var expected = '%(test){color: #ffffff;}Hello, world%';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Strong', function() {
      var content = '<strong>Hello, world</strong>';
      var expected = '*Hello, world*';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Italic', function() {
      var content = '<em style="color: rgb(12, 34, 56);">Hello, world</em>';
      var expected = '_{color: #0c2238;}Hello, world_';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Inline code', function() {
      var content = '<code>Hello, world</code>';
      var expected = '@Hello, world@';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Auto link (mailto)', function() {
      var content = '<a href="mailto:foo@example.com">foo@example.com</a><br><a href="mailto:foo@example.com">foo@example.com</a><br>foo<a href="mailto:foo@example.com">foo@example.com</a><br><a href="mailto:foo@example.com">foo@example.com</a>bar<br>foo<a href="mailto:foo@example.com">foo@example.com</a>bar';
      var expected = 'foo@example.com\nfoo@example.com\nfoo foo@example.com\nfoo@example.com bar\nfoo foo@example.com bar';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Auto link (http)', function() {
      var content = '<a href="http://example.com">http://example.com</a><br><a href="http://example.com">http://example.com</a><br>foo<a href="http://example.com">http://example.com</a><br><a href="http://example.com">http://example.com</a>bar<br>foo<a href="http://example.com">http://example.com</a>bar';
      var expected = 'http://example.com\nhttp://example.com\nfoo http://example.com\nhttp://example.com bar\nfoo http://example.com bar';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Auto link (http with trailing slash)', function() {
      var content = '<a href="http://example.com/">http://example.com</a><br><a href="http://example.com/">http://example.com</a><br>foo<a href="http://example.com/">http://example.com</a><br><a href="http://example.com/">http://example.com</a>bar<br>foo<a href="http://example.com/">http://example.com</a>bar';
      var expected = 'http://example.com\nhttp://example.com\nfoo http://example.com\nhttp://example.com bar\nfoo http://example.com bar';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image (external)', function() {
      var content = '<img src="http://example.com/foo.png"><br><img src="http://example.com/attachments/download/10/foo.png">';
      var expected = '!http://example.com/foo.png!\n!http://example.com/attachments/download/10/foo.png!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image (attachment)', function() {
      var content = '<img src="/attachments/download/1/foo.png"><br><img src="/attachments/download/2/f%20o%20o.png"><br><img src="/attachments/download/3/%E3%83%95%E3%83%BC.png"><br><img src="/attachments/download/4/%21%26%28%29%2B%5B%5D.png">';
      var expected = '!foo.png!\n!f%20o%20o.png!\n!フー.png!\n!%21%26%28%29%2b%5b%5d.png!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image with style attribute', function() {
      var content = '<img src="http://example.com/foo.png" alt="Foo" style="width: 100%"><br><img src="http://example.com/foo.png" alt="Foo" width="640" height="480">';
      var expected = '!{width: 100%;}http://example.com/foo.png(Foo)!\n!{height: 480px; width: 640px;}http://example.com/foo.png(Foo)!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image link', function() {
      var content = '<a href="http://example.com/foo/"><img src="http://example.com/foo.png"></a><br><a href="http://example.com/foo/"><img src="http://example.com/foo.png" width="640" height="480"></a>';
      var expected = '!http://example.com/foo.png!:http://example.com/foo/\n!{height: 480px; width: 640px;}http://example.com/foo.png!:http://example.com/foo/';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Abbreviation', function() {
      var content = '<abbr title="Richard Matthew Stallman">RMS</abbr>';
      var expected = 'RMS(Richard Matthew Stallman)';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Horizontal rule', function() {
      var content = '<hr>';
      var expected = '---';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Preformatted', function() {
      var content = '<pre>#include &lt;stdio.h&gt;<br><br>int main(int argc, char *argv[])<br>{<br>    printf("Hello, world<br>");<br><br>    return 0;<br>}<br></pre><br><br><pre>No newline at the end of the content</pre>';
      var expected = '<pre>\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</pre>\n\n<pre>\nNo newline at the end of the content</pre>';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Code block', function() {
      var content = '<pre><code class="c">#include &lt;stdio.h&gt;<br><br>int main(int argc, char *argv[])<br>{<br>    printf("Hello, world<br>");<br><br>    return 0;<br>}<br></code></pre>';
      var expected = '<pre><code class="c">\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</code></pre>';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Code block (code sample plugin)', function() {
      var content = '<pre class="language-c" contenteditable="false"><code>#include &lt;stdio.h&gt;<br><br>int main(int argc, char *argv[])<br>{<br>    printf("Hello, world<br>");<br><br>    return 0;<br>}<br></code></pre>';
      var expected = '<pre><code class="c">\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</code></pre>';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Block quote', function() {
      var content = '<blockquote><blockquote><p>Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.<br>To go live, all you need to add is a database and a web server.</p></blockquote><p>Great!</p></blockquote>';
      var expected = '> > Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.\n> > To go live, all you need to add is a database and a web server.\n> \n> Great!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Table', function() {
      var content = '<table style="width: 100%"><tbody><tr><th>UserID</th><th>Name</th><th>Group</th><th><p>attribute list</p></th></tr><tr><td>Starting with</td><td>a</td><td>simple</td><td>row</td></tr><tr><td style="text-align:center;" colspan="3">IT</td><td style="text-align:left;">align left</td></tr><tr><td>1</td><td>Artur Pirozhkov</td><td rowspan="2">Users</td><td style="text-align:right;">align right</td></tr><tr style="color: #dad;"><td>2</td><td>Vasya Rogov</td><td style="text-align:center;">center</td></tr><tr><td>3</td><td>John Smith</td><td>Admin<br>(root)</td><td style="vertical-align:top;">valign top</td></tr><tr><td>4</td><td>-</td><td><p>Nobody<br>(anonymous) </p></td><td style="vertical-align:bottom;">valign bottom</td></tr></tbody></table>';
      var expected = 'table{width: 100%;}.\n|_. UserID |_. Name |_. Group |_. attribute list |\n| Starting with | a | simple | row |\n|\\3=. IT |<. align left |\n| 1 | Artur Pirozhkov |/2. Users |>. align right |\n{color: #ddaadd;}. | 2 | Vasya Rogov |=. center |\n| 3 | John Smith | Admin\n(root) |^. valign top |\n| 4 | - | Nobody\n(anonymous) |~. valign bottom |';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Paragraph with style attribute', function() {
      var content = '<p style="color: rgb(255, 255, 255); background-color: #dc3545"; opacity: 0.5; width: 100%">Hello, world</p>';
      var expected = 'p{background-color: #dc3545; color: #ffffff;}. Hello, world';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Decoration partially in a word', function() {
      var content = '<p><span style="text-decoration: underline">W</span>e <span style="text-decoration: underline">ar</span>e t<span style="text-decoration: underline">h</span>e <span style="text-decoration: underline">champions</span> of t<span style="text-decoration: underline">he</span> wor<span style="text-decoration: underline">ld</span></p><p><span style="text-decoration: line-through">W</span>e <span style="text-decoration: line-through">ar</span>e t<span style="text-decoration: line-through">h</span>e <span style="text-decoration: line-through">champions</span> of t<span style="text-decoration: line-through">he</span> wor<span style="text-decoration: line-through">ld</span></p><p><strong>W</strong>e <strong>ar</strong>e t<strong>h</strong>e <strong>champions</strong> of t<strong>he</strong> wor<strong>ld</strong></p><p><em>W</em>e <em>ar</em>e t<em>h</em>e <em>champions</em> of t<em>he</em> wor<em>ld</em></p><p><code>W</code>e <code>ar</code>e t<code>h</code>e <code>champions</code> of t<code>he</code> wor<code>ld</code></p><p>';
      var expected = '+W+<notextile></notextile>e +ar+<notextile></notextile>e t<notextile></notextile>+h+<notextile></notextile>e +champions+ of t<notextile></notextile>+he+ wor<notextile></notextile>+ld+\n\n-W-<notextile></notextile>e -ar-<notextile></notextile>e t<notextile></notextile>-h-<notextile></notextile>e -champions- of t<notextile></notextile>-he- wor<notextile></notextile>-ld-\n\n*W*<notextile></notextile>e *ar*<notextile></notextile>e t<notextile></notextile>*h*<notextile></notextile>e *champions* of t<notextile></notextile>*he* wor<notextile></notextile>*ld*\n\n_W_<notextile></notextile>e _ar_<notextile></notextile>e t<notextile></notextile>_h_<notextile></notextile>e _champions_ of t<notextile></notextile>_he_ wor<notextile></notextile>_ld_\n\n@W@ e @ar@ e t @h@ e @champions@ of t @he@ wor @ld@';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Decorations not separated by space', function() {
      var content = 'normal<strong>bold</strong><em>italic</em><span style="text-decoration: underline">underline</span><span style="text-decoration: line-through">strikethrough</span>normal<br><strong>bold</strong><br><em>italic</em><br><span style="text-decoration: underline">underline</span><br><span style="text-decoration: line-through">strikethrough</span><br><code>code</code><br>normal';
      var expected = 'normal<notextile></notextile>*bold*<notextile></notextile><notextile></notextile>_italic_<notextile></notextile><notextile></notextile>+underline+<notextile></notextile><notextile></notextile>-strikethrough-<notextile></notextile>normal\n*bold*\n_italic_\n+underline+\n-strikethrough-\n@code@\nnormal';

      assert.equal(x._toTextTextile(content), expected);
    });

    isBrowser &&
    test('Pasting as HTML', function() {
      var content = '<div><h1 style="box-sizing: border-box; font-size: 2em; margin-top: 0px !important; margin-right: 0px; margin-bottom: 16px; margin-left: 0px; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; border-bottom: 1px solid rgb(234, 236, 239); color: rgb(36, 41, 46); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;">Redmine WYSIWYG Editor plugin</h1><p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 16px; color: rgb(36, 41, 46); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;">This plugin adds WYSIWYG editor mode to Redmine.</p></div>';
      var expected = 'h1{background-color: #ffffff; border-bottom: 1px solid #eaecef; color: #24292e; font-size: 2em; font-style: normal; font-variant-caps: normal; font-variant-ligatures: normal; font-weight: 600; margin-bottom: 16px; margin-left: 0px; margin-right: 0px; padding-bottom: 0.3em;}. Redmine WYSIWYG Editor plugin\n\np{background-color: #ffffff; color: #24292e; font-size: 16px; font-style: normal; font-variant-caps: normal; font-variant-ligatures: normal; font-weight: 400; margin-bottom: 16px; margin-top: 0px;}. This plugin adds WYSIWYG editor mode to Redmine.';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Wiki link', function() {
      var content = '<a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith#Steven">Steven Tyler</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith">Joe</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith">Aerosmith</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki">Aerosmith Wiki</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki">aerosmith</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR#Axl">Axl Rose</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR">Slash</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR">GnR</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki">Guns N\' Roses</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki">gnr</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR?parent=Wiki">GnR</a><br><a class="wiki-page" href="#Axl">#Axl</a><br><a class="wiki-page" href="#Axl">Axl Rose</a>';
      var expected = '[[aerosmith:Aerosmith#Steven|Steven Tyler]]\n[[aerosmith:Aerosmith|Joe]]\n[[aerosmith:Aerosmith]]\n[[aerosmith:|Aerosmith Wiki]]\n[[aerosmith:]]\n[[GnR#Axl|Axl Rose]]\n[[GnR|Slash]]\n[[GnR]]\n[[gnr:|Guns N\' Roses]]\n[[gnr:]]\n[[GnR]]\n[[#Axl]]\n[[#Axl|Axl Rose]]';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (issue)', function() {
      var content = '<a class="issue">#1</a>';
      var expected = '#1';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (version)', function() {
      var content = '<a class="version">1.0.0</a><br><a class="version">1 0 0</a>';
      var expected = 'version:1.0.0\nversion:"1 0 0"';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (attachment)', function() {
      var content = '<a class="attachment">foo.png</a><br><a class="attachment">f o o.png</a>';
      var expected = 'attachment:foo.png\nattachment:"f o o.png"';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (project)', function() {
      var content = '<a class="project">X</a><br><a class="project">X Y Z</a>';
      var expected = 'project:X\nproject:"X Y Z"';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (user)', function() {
      var content = '<a class="user" href="/redmine/user/5">Axl Rose</a>';
      var expected = 'user#5';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Resource link (note)', function() {
      var content = '<a href="#note-256">#note-256</a>';
      var expected = '#note-256';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('NBSP', function() {
      var content = 'foo<br>&nbsp;<a class="issue">#1</a><br><a class="issue">#2</a>&nbsp;<br>&nbsp;<a class="issue">#3</a>&nbsp;<br>&nbsp;<img src="/attachments/download/1/foo.png"><br><img src="/attachments/download/1/foo.png">&nbsp;<br>&nbsp;<img src="/attachments/download/1/foo.png">&nbsp;<br>bar';
      var expected = 'foo\n\u00a0 #1\n#2 \u00a0\n\u00a0 #3 \u00a0\n\u00a0 !foo.png!\n!foo.png! \u00a0\n\u00a0 !foo.png! \u00a0\nbar';

      assert.equal(x._toTextTextile(content), expected);
    });
  });

  suite('Markdown', function() {
    var x = new RedmineWysiwygEditor(null, null);

    x.setProject(1, 'gnr');
    x.setAttachments([{name: 'foo.png', id: 1},
                      {name: 'f o o.png', id: 2},
                      {name: 'フー.png', id: 3},
                      {name: '!&()+[].png', id: 4}]);

    test('Line-through', function() {
      var content = '<span style="text-decoration: line-through">Hello, world</span><br><del>Hello, world</del>';
      var expected = '~~Hello, world~~\n~~Hello, world~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Strong', function() {
      var content = '<strong>Hello, world</strong>';
      var expected = '**Hello, world**';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Italic', function() {
      var content = '<em>Hello, world</em>';
      var expected = '*Hello, world*';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Deleted', function() {
      var content = '<del>Hello, world</del>';
      var expected = '~~Hello, world~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (mailto)', function() {
      var content = '<a href="mailto:foo@example.com">foo@example.com</a><br><a href="mailto:foo@example.com">foo@example.com</a><br>foo<a href="mailto:foo@example.com">foo@example.com</a><br><a href="mailto:foo@example.com">foo@example.com</a>bar<br>foo<a href="mailto:foo@example.com">foo@example.com</a>bar';
      var expected = 'foo@example.com\nfoo@example.com\nfoo foo@example.com\nfoo@example.com bar\nfoo foo@example.com bar';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (http)', function() {
      var content = '<a href="http://example.com">http://example.com</a><br><a href="http://example.com">http://example.com</a><br>foo<a href="http://example.com">http://example.com</a><br><a href="http://example.com">http://example.com</a>bar<br>foo<a href="http://example.com">http://example.com</a>bar';
      var expected = 'http://example.com\nhttp://example.com\nfoo http://example.com\nhttp://example.com bar\nfoo http://example.com bar';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (http with trailing slash)', function() {
      var content = '<a href="http://example.com/">http://example.com</a><br><a href="http://example.com/">http://example.com</a><br>foo<a href="http://example.com/">http://example.com</a><br><a href="http://example.com/">http://example.com</a>bar<br>foo<a href="http://example.com/">http://example.com</a>bar';
      var expected = 'http://example.com\nhttp://example.com\nfoo http://example.com\nhttp://example.com bar\nfoo http://example.com bar';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Table', function() {
      var content = '<table><tbody><tr><th>Name</th><th style="text-align: left;">Role</th><th style="text-align: center;">Born</th><th style="text-align: right;"><p>Origin</p></th></tr><tr><td>Axl Rose</td><td>Vocal</td><td>Feb 6, 1962</td><td>LA</td></tr><tr><td>Slash</td><td>Guitar</td><td><p>Jul 23, 1965</p></td><td>LA</td></tr></tbody></table>';
      var expected = '| Name | Role | Born | Origin |\n| --- | :-- | :-: | --: |\n| Axl Rose | Vocal | Feb 6, 1962 | LA |\n| Slash | Guitar | Jul 23, 1965 | LA |';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Table without TH', function() {
      var content = '<table><tbody><tr><td>Name</td><td style="text-align: left;">Role</td><td style="text-align: center;">Born</td><td style="text-align: right;">Origin</td></tr><tr><td>Axl Rose</td><td>Vocal</td><td>Feb 6, 1962</td><td>LA</td></tr><tr><td>Slash</td><td>Guitar</td><td>Jul 23, 1965</td><td>LA</td></tr></tbody></table>';
      var expected = '| Name | Role | Born | Origin |\n| --- | :-- | :-: | --: |\n| Axl Rose | Vocal | Feb 6, 1962 | LA |\n| Slash | Guitar | Jul 23, 1965 | LA |';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Preformatted', function() {
      var content = '<pre>#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</pre>\n\n<pre>No newline at the end of the content</pre>';
      var expected = '~~~\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n~~~\n\n~~~\nNo newline at the end of the content\n~~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Code block', function() {
      var content = '<pre data-code="c">#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</pre>';
      var expected = '~~~ c\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n~~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Code block (code sample plugin)', function() {
      var content = '<pre class="language-c" contenteditable="false"><code>#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</code></pre>';
      var expected = '~~~ c\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n} \n~~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Block quote', function() {
      var content = '<blockquote><blockquote><p>Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.<br>To go live, all you need to add is a database and a web server.</p></blockquote><p>Great!</p></blockquote>';
      var expected = '> > Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.\n> > To go live, all you need to add is a database and a web server.\n> \n> Great!';
      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Image (external)', function() {
      var content = '<img src="http://example.com/foo.png" alt="Foo"><br><img src="http://example.com/attachments/download/10/foo.png" alt="Foo">';
      var expected = '![Foo](http://example.com/foo.png)\n![Foo](http://example.com/attachments/download/10/foo.png)';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Image (attachment)', function() {
      var content = '<img src="/attachments/download/1/foo.png" alt="Foo"><br><img src="/attachments/download/2/f%20o%20o.png"><br><img src="/attachments/download/3/%E3%83%95%E3%83%BC.png"><br><img src="/attachments/download/4/%21%26%28%29%2B%5B%5D.png">';
      var expected = '![Foo](foo.png)\n![](f%20o%20o.png)\n![](フー.png)\n![](%21%26%28%29%2b%5b%5d.png)';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('HTML tag (DIV)', function() {
      var content = '<div style="padding-left: 1em;">\nleft ident 1em\n</div>\n\n<div style="padding-left: 2em;">\nleft ident 2em\nas well as for following lines\n</div>\n\n<div style="text-align: right;">\nright aligned\n</div>\n\n<div style="padding-right: 3em;text-align: right;">\nright ident 3em\n</div>\n\n<div style="text-align: center;">\nThis is centered paragraph.\n</div>';
      var expected = '<div style="padding-left: 1em;">\nleft ident 1em\n</div>\n<div style="padding-left: 2em;">\nleft ident 2em as well as for following lines\n</div>\n<div style="text-align: right;">\nright aligned\n</div>\n<div style="padding-right: 3em; text-align: right;">\nright ident 3em\n</div>\n<div style="text-align: center;">\nThis is centered paragraph.\n</div>';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('HTML tag (P)', function() {
      var content = '<p style="padding-left: 1em;">left ident 1em</p>\n<p style="padding-left: 2em;">left ident 2em\nas well as for following lines</p>\n<p style="text-align: right;">right aligned</p>\n<p style="padding-right: 3em;text-align: right;">right ident 3em</p>\n<p style="text-align: center;">This is centered paragraph.</p>';
      var expected = '<p style="padding-left: 1em;">left ident 1em</p>\n<p style="padding-left: 2em;">left ident 2em as well as for following lines</p>\n<p style="text-align: right;">right aligned</p>\n<p style="padding-right: 3em; text-align: right;">right ident 3em</p>\n<p style="text-align: center;">This is centered paragraph.</p>';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('HTML tag (SPAN)', function() {
      var content = '<span style="color:red">red</span> <span style="color:green">green</span> <span style="color:yellow">yellow</span> <span style="color:#82B6E1">blue ish</span><br>\n<span style="color:red">red</span><span style="color:green">green</span><span style="color:yellow">yellow</span><span style="color:#82B6E1">blue ish</span><br>\n<span style="background-color:lightgreen">Lightgreen Background</span> <span style="background-color:yellow">Yellow Background</span><br>\n<span style="background-color:lightgreen">Lightgreen Background</span><span style="background-color:yellow">Yellow Background</span>';
      var expected = '<span style="color: red;">red</span> <span style="color: green;">green</span> <span style="color: yellow;">yellow</span> <span style="color: rgb(130, 182, 225);">blue ish</span>\n<span style="color: red;">red</span><span style="color: green;">green</span><span style="color: yellow;">yellow</span><span style="color: rgb(130, 182, 225);">blue ish</span>\n<span style="background-color: lightgreen;">Lightgreen Background</span> <span style="background-color: yellow;">Yellow Background</span>\n<span style="background-color: lightgreen;">Lightgreen Background</span><span style="background-color: yellow;">Yellow Background</span>';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Underline', function() {
      var content = '<span style="text-decoration: underline">Hello, world</span><br><u>Hello, world</u>';
      var expected = '_Hello, world_\n_Hello, world_';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Font styles', function() {
      var content = 'Plain<sup>superscript</sup><br>Plain<sub>subscript</sub>';
      var expected = 'Plain<sup>superscript</sup>\nPlain<sub>subscript</sub>';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Wiki link', function() {
      var content = '<a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith#Steven">Steven Tyler</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith">Joe</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki/Aerosmith">Aerosmith</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki">Aerosmith Wiki</a><br><a class="wiki-page" href="/redmine/projects/aerosmith/wiki">aerosmith</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR#Axl">Axl Rose</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR">Slash</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR">GnR</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki">Guns N\' Roses</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki">gnr</a><br><a class="wiki-page" href="/redmine/projects/gnr/wiki/GnR?parent=Wiki">GnR</a><br><a class="wiki-page" href="#Axl">#Axl</a><br><a class="wiki-page" href="#Axl">Axl Rose</a>';
      var expected = '[[aerosmith:Aerosmith#Steven|Steven Tyler]]\n[[aerosmith:Aerosmith|Joe]]\n[[aerosmith:Aerosmith]]\n[[aerosmith:|Aerosmith Wiki]]\n[[aerosmith:]]\n[[GnR#Axl|Axl Rose]]\n[[GnR|Slash]]\n[[GnR]]\n[[gnr:|Guns N\' Roses]]\n[[gnr:]]\n[[GnR]]\n[[#Axl]]\n[[#Axl|Axl Rose]]';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (issue)', function() {
      var content = '<a class="issue">#1</a>';
      var expected = '#1';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (version)', function() {
      var content = '<a class="version">1.0.0</a><br><a class="version">1 0 0</a>';
      var expected = 'version:1.0.0\nversion:"1 0 0"';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (attachment)', function() {
      var content = '<a class="attachment">foo.png</a><br><a class="attachment">f o o.png</a>';
      var expected = 'attachment:foo.png\nattachment:"f o o.png"';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (project)', function() {
      var content = '<a class="project">X</a><br><a class="project">X Y Z</a>';
      var expected = 'project:X\nproject:"X Y Z"';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (user)', function() {
      var content = '<a class="user" href="/redmine/user/5">Axl Rose</a>';
      var expected = 'user#5';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Resource link (note)', function() {
      var content = '<a href="#note-256">#note-256</a>';
      var expected = '#note-256';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('NBSP', function() {
      var content = 'foo<br>&nbsp;<a class="issue">#1</a><br><a class="issue">#2</a>&nbsp;<br>&nbsp;<a class="issue">#3</a>&nbsp;<br>bar';
      var expected = 'foo\n\u00a0 #1\n#2 \u00a0\n\u00a0 #3 \u00a0\nbar';

      assert.equal(x._toTextMarkdown(content), expected);
    });
  });

  suite('Markdown (HTML tag enabled)', function() {
    var x = new RedmineWysiwygEditor(null, null);

    x.setHtmlTagAllowed(true);
    x.setAttachments([{name: 'foo.png', id: 1},
                      {name: 'f o o.png', id: 2},
                      {name: 'フー.png', id: 3},
                      {name: '!&()+[].png', id: 4}]);

    test('Image (attachment)', function() {
      var content = '<img src="/attachments/download/1/foo.png" alt="Foo"><br><img src="/attachments/download/2/f%20o%20o.png"><br><img src="/attachments/download/3/%E3%83%95%E3%83%BC.png"><br><img src="/attachments/download/4/%21%26%28%29%2B%5B%5D.png">';
      var expected = '![Foo](foo.png)\n![](f%20o%20o.png)\n![](フー.png)\n![](%21%26%28%29%2b%5b%5d.png)';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Image (resized)', function() {
      var content = '<img src="/attachments/download/1/foo.png" alt="Foo" width="5296" height="3972"><br><img src="/attachments/download/2/f%20o%20o.png" width="5296" height="3972"><br><img src="/attachments/download/3/%E3%83%95%E3%83%BC.png" width="5296" height="3972">';

      var expected = '<img src="/attachments/download/1/foo.png" alt="Foo" width="5296" height="3972">\n<img src="/attachments/download/2/f%20o%20o.png" width="5296" height="3972">\n<img src="/attachments/download/3/%E3%83%95%E3%83%BC.png" width="5296" height="3972">';

      assert.equal(x._toTextMarkdown(content), expected);
    });
  });
});

}));
