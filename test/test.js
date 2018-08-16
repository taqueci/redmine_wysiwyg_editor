var assert = chai.assert;

suite('Redmine WYSIWYG Editor', function() {
  suite('Textile', function() {
    var x = new RedmineWysiwygEditor(null, null);

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
      var content = '<span>Hello, world</span>';
      var expected = '%Hello, world%';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Span with style attribute', function() {
      var content = '<span style="color: rgb(255, 255, 255); background-color: #dc3545"; opacity: 0.5; width: 100%">Hello, world</span>';
      var expected = '%{background-color: #dc3545; color: #ffffff;}Hello, world%';

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

    test('Auto link (mailto)', function() {
      var content = '<a href="mailto:foo@example.com">foo@example.com</a>';
      var expected = 'foo@example.com';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Auto link (http)', function() {
      var content = '<a href="http://example.com">http://example.com</a>';
      var expected = 'http://example.com';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Auto link (http with trailing slash)', function() {
      var content = '<a href="http://example.com/">http://example.com</a>';
      var expected = 'http://example.com';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image (external)', function() {
      var content = '<img src="http://example.com/foo.png">';
      var expected = '!http://example.com/foo.png!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image (attachment)', function() {
      var content = '<img src="/attachments/download/1/foo.png">';
      var expected = '!foo.png!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image with style attribute', function() {
      var content = '<img src="http://example.com/foo.png" alt="Foo" style="width: 100%">';
      var expected = '!{width: 100%;}http://example.com/foo.png(Foo)!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Image link', function() {
      var content = '<a href="http://example.com/foo/"><img src="http://example.com/foo.png"></a>';
      var expected = '!http://example.com/foo.png!:http://example.com/foo/';

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

    test('Code block', function() {
      var content = '<pre><code class="c">#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</code></pre>';
      var expected = '<pre><code class="c">\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</code></pre>';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Block quote', function() {
      var content = '<blockquote><blockquote><p>Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.<br>To go live, all you need to add is a database and a web server.</p></blockquote><p>Great!</p></blockquote>';
      var expected = '> > Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.\n> > To go live, all you need to add is a database and a web server.\n> \n> Great!';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Table', function() {
      var content = '<table style="width: 100%"><tbody><tr><th>UserID</th><th>Name</th><th>Group</th><th>attribute list</th></tr><tr><td>Starting with</td><td>a</td><td>simple</td><td>row</td></tr><tr><td style="text-align:center;" colspan="3">IT</td><td style="text-align:left;">align left</td></tr><tr><td>1</td><td>Artur Pirozhkov</td><td rowspan="2">Users</td><td style="text-align:right;">align right</td></tr><tr style="color: #dad;"><td>2</td><td>Vasya Rogov</td><td style="text-align:center;">center</td></tr><tr><td>3</td><td>John Smith</td><td>Admin<br>(root)</td><td style="vertical-align:top;">valign top</td></tr><tr><td>4</td><td>-</td><td>Nobody<br>(anonymous) </td><td style="vertical-align:bottom;">valign bottom</td></tr></tbody></table>';
      var expected = 'table{width: 100%;}.\n|_. UserID |_. Name |_. Group |_. attribute list |\n| Starting with | a | simple | row |\n|\\3=. IT |<. align left |\n| 1 | Artur Pirozhkov |/2. Users |>. align right |\n{color: #ddaadd;}. | 2 | Vasya Rogov |=. center |\n| 3 | John Smith | Admin\n(root) |^. valign top |\n| 4 | - | Nobody\n(anonymous) |~. valign bottom |';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Paragraph with style attribute', function() {
      var content = '<p style="color: rgb(255, 255, 255); background-color: #dc3545"; opacity: 0.5; width: 100%">Hello, world</p>';
      var expected = 'p{color: #ffffff; background-color: #dc3545;}. Hello, world';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Decoration partially in a word', function() {
      var content = '<p><span style="text-decoration: underline">W</span>e <span style="text-decoration: underline">ar</span>e t<span style="text-decoration: underline">h</span>e <span style="text-decoration: underline">champions</span> of t<span style="text-decoration: underline">he</span> wor<span style="text-decoration: underline">ld</span></p><p><span style="text-decoration: line-through">W</span>e <span style="text-decoration: line-through">ar</span>e t<span style="text-decoration: line-through">h</span>e <span style="text-decoration: line-through">champions</span> of t<span style="text-decoration: line-through">he</span> wor<span style="text-decoration: line-through">ld</span></p><p><strong>W</strong>e <strong>ar</strong>e t<strong>h</strong>e <strong>champions</strong> of t<strong>he</strong> wor<strong>ld</strong></p><p><em>W</em>e <em>ar</em>e t<em>h</em>e <em>champions</em> of t<em>he</em> wor<em>ld</em></p>';
      var expected = '+W+<notextile></notextile>e +ar+<notextile></notextile>e t<notextile></notextile>+h+<notextile></notextile>e +champions+ of t<notextile></notextile>+he+ wor<notextile></notextile>+ld+\n\n-W-<notextile></notextile>e -ar-<notextile></notextile>e t<notextile></notextile>-h-<notextile></notextile>e -champions- of t<notextile></notextile>-he- wor<notextile></notextile>-ld-\n\n*W*<notextile></notextile>e *ar*<notextile></notextile>e t<notextile></notextile>*h*<notextile></notextile>e *champions* of t<notextile></notextile>*he* wor<notextile></notextile>*ld*\n\n_W_<notextile></notextile>e _ar_<notextile></notextile>e t<notextile></notextile>_h_<notextile></notextile>e _champions_ of t<notextile></notextile>_he_ wor<notextile></notextile>_ld_';

      assert.equal(x._toTextTextile(content), expected);
    });

    test('Decorations not separated by space', function() {
      var content = 'normal<strong>bold</strong><em>italic</em><span style="text-decoration: underline">underline</span><span style="text-decoration: line-through">strikethrough</span>normal';
      var expected = 'normal<notextile></notextile>*bold*<notextile></notextile><notextile></notextile>_italic_<notextile></notextile><notextile></notextile>+underline+<notextile></notextile><notextile></notextile>-strikethrough-<notextile></notextile>normal';

      assert.equal(x._toTextTextile(content), expected);
    });
  });

  suite('Markdown', function() {
    var x = new RedmineWysiwygEditor(null, null);

    test('Line-through', function() {
      var content = '<span style="text-decoration: line-through">Hello, world</span>';
      var expected = '~~Hello, world~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Deleted', function() {
      var content = '<del>Hello, world</del>';
      var expected = '~~Hello, world~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (mailto)', function() {
      var content = '<a href="mailto:foo@example.com">foo@example.com</a>';
      var expected = 'foo@example.com';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (http)', function() {
      var content = '<a href="http://example.com">http://example.com</a>';
      var expected = 'http://example.com';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Auto link (http with trailing slash)', function() {
      var content = '<a href="http://example.com/">http://example.com</a>';
      var expected = 'http://example.com';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Table', function() {
      var content = '<table><tbody><tr><th>Name</th><th>Role</th></tr><tr><td> Axl Rose</td><td>Vocal</td></tr><tr><td>Slash</td><td>Guitar</td></tr></tbody></table>';
      var expected = '| Name | Role |\n| --- | --- |\n| Axl Rose | Vocal |\n| Slash | Guitar |';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Preformatted', function() {
      var content = '<pre>#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</pre>';
      var expected = '~~~\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n~~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Code block', function() {
      var content = '<pre data-code="c">#include &lt;stdio.h&gt;\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n</pre>';
      var expected = '~~~ c\n#include <stdio.h>\n\nint main(int argc, char *argv[])\n{\n    printf("Hello, world\n");\n\n    return 0;\n}\n~~~';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Block quote', function() {
      var content = '<blockquote><blockquote><p>Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.<br>To go live, all you need to add is a database and a web server.</p></blockquote><p>Great!</p></blockquote>';
      var expected = '> > Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.\n> > To go live, all you need to add is a database and a web server.\n> \n> Great!';
      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Image (external)', function() {
      var content = '<img src="http://example.com/foo.png" alt="Foo">';
      var expected = '![Foo](http://example.com/foo.png)';

      assert.equal(x._toTextMarkdown(content), expected);
    });

    test('Image (attachment)', function() {
      var content = '<img src="/attachments/download/1/foo.png" alt="Foo">';
      var expected = '![Foo](foo.png)';

      assert.equal(x._toTextMarkdown(content), expected);
    });
  });
});
