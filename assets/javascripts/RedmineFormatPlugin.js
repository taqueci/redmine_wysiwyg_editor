(function() {
  var CODE_CLASS_PATTERNS = [
    /^(?:language|code)-(\S+)$/, // CommonMark
    /^(\S+)\s+syntaxhl$/, // Redmine
  ];

  tinymce.PluginManager.add('redmineformat', function (editor) {
    var $ = editor.$;

    function replaceBrWithNl(node) {
      $(node).find('br').each(function (index, node) {
        node.parentNode.replaceChild(document.createTextNode('\n'), node);
      });
    }

    function codeBlockLanguage(preNode) {
      var singleChild = preNode.childNodes.length === 1 && preNode.firstChild;
      var codeNode = singleChild && singleChild.nodeName === 'CODE'
        && singleChild.className ? singleChild : preNode;
      if (!codeNode.className) {
        return null;
      }
      return CODE_CLASS_PATTERNS.reduce(function (match, regexp) {
        return match || (codeNode.className.match(regexp) || [null, null])[1];
      }, null);
    }

    editor.on('SetContent', function () {
      $('pre').filter(function (index, node) {
        return !!codeBlockLanguage(node);
      }).each(function (index, node) {
        var language = codeBlockLanguage(node);
        replaceBrWithNl(node);
        node.innerHTML = editor.dom.encode(node.textContent);
        node.className = "language-" + language;
      });
    });

    editor.on('PreProcess', function (e) {
      $('pre', e.node).each(function (index, node) {
        replaceBrWithNl(node);
        node.normalize();
      });
    });
  });
})();
