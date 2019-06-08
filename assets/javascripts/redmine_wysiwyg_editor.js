function RedmineWysiwygEditor(jstEditor, previewUrl) {
  this._jstEditor = jstEditor;
  this._previewUrl = previewUrl;
  this._postInit = function() {};

  this._format = 'textile';
  this._language = 'en';
  this._i18n = {
    textile: 'Textile',
    markdown: 'Markdown',
    visual: 'Visual editor',
    preview: 'Preview'
  };

  this._attachments = [];
  this._attachmentUploader = function(file) { return false };

  this._htmlTagAllowed = false;

  this._defaultModeKey = 'redmine-wysiwyg-editor-mode';
}

RedmineWysiwygEditor.prototype.setPostInitCallback = function(func) {
  this._postInit = func;
};

RedmineWysiwygEditor.prototype.setFormat = function(format) {
  this._format = format;
};

RedmineWysiwygEditor.prototype.setLanguage = function(lang) {
  var option = ['af_ZA', 'ar', 'be', 'bg_BG', 'bn_BD', 'ca', 'cs', 'cs_CZ', 'cy', 'da', 'de', 'de_AT', 'dv', 'el', 'en_CA', 'en_GB', 'es', 'es_MX', 'et', 'eu', 'fa_IR', 'fi', 'fr_FR', 'ga', 'gl', 'he_IL', 'hr', 'hu_HU', 'id', 'it', 'ja', 'ka_GE', 'kab', 'kk', 'km_KH', 'ko_KR', 'lt', 'lv', 'nb_NO', 'nl', 'pl', 'pt_BR', 'pt_PT', 'ro', 'ru', 'sk', 'sl_SI', 'sr', 'sv_SE', 'ta', 'ta_IN', 'th_TH', 'tr', 'tr_TR', 'ug', 'uk', 'uk_UA', 'uz', 'vi_VN', 'zh_CN', 'zh_TW'];

  var language = lang.replace(/-.+/, function(match, offset, string)  {
    return match.toUpperCase().replace('-', '_');
  });

  this._language = (option.indexOf(language) >= 0) ? language : 'en';
};

RedmineWysiwygEditor.prototype.setI18n = function(data) {
  this._i18n = data;
};

RedmineWysiwygEditor.prototype.setAttachments = function(files) {
  this._attachment = files;
};

RedmineWysiwygEditor.prototype.setAttachmentUploader = function(handler) {
  this._attachmentUploader = handler;
};

RedmineWysiwygEditor.prototype.setHtmlTagAllowed = function(isAllowed) {
  this._htmlTagAllowed = isAllowed;
};

RedmineWysiwygEditor.prototype.setAutocompleteIssuePath = function(path) {
  this._autocompleteIssuePath = path;
};

RedmineWysiwygEditor.prototype.init = function(editorSetting) {
  var self = this;

  var container = self._jstEditor.parent();

  if (container.find('.wysiwyg-editor').length > 0) return false;

  var editorHtml = '<div class="wysiwyg-editor"><div></div></div>';

  var previewHtml = '<div class="wysiwyg-editor-preview wiki"></div>';

  var modeTabHtml = '<div class="wysiwyg-editor-tab"><ul>' +
      '<li><a href="#" data-type="text" class="active">' +
      self._i18n[self._format] + '</a></li>' +
      '<li><a href="#" data-type="visual">' +
      self._i18n.visual + '</a></li>' +
      '<li><a href="#" data-type="preview">' +
      self._i18n.preview + '</a></li>' +
      '</ul></div>';

  self._jstEditorTextArea = self._jstEditor.find('textarea');

  self._jstEditorTextArea.after(previewHtml);
  self._jstEditor.after(editorHtml + modeTabHtml);

  self._visualEditor = container.find('.wysiwyg-editor').hide();
  self._preview = container.find('.wysiwyg-editor-preview').hide();
  self._modeTab = container.find('.wysiwyg-editor-tab');

  var jstTabs = container.find('.jstTabs');
  var jstElements = container.find('.jstElements');

  if (jstTabs.length > 0) {
    self._jstElements = jstTabs;
    self._oldPreviewAccess = false;
    self._preview.addClass('wiki-preview');
  } else {
    self._jstElements = jstElements;
    self._oldPreviewAccess = true;
  }

  self._modeTab.on('click', 'li a', function(e) {
    e.preventDefault();
    self.changeMode($(this).data('type'));
  });

  self._defaultMode =
    (('localStorage' in window) && (window.localStorage !== null)) ? {
      get: function() {
        return localStorage.getItem(self._defaultModeKey) || 'text';
      },
      set: function(mode) {
        localStorage.setItem(self._defaultModeKey, mode);
      }
    } : {
      get: function() {return 'text'},
      set: function() {}
    };

  self._initTinymce(editorSetting);

  return true;
};

RedmineWysiwygEditor.prototype.changeMode = function(mode) {
  var self = this;

  if (!self._editor) return false;

  self._modeTab.find('li a').each(function() {
    if ($(this).data('type') === mode) $(this).addClass('active');
    else $(this).removeClass('active');
  });

  switch (mode) {
  case 'visual':
    self._setVisualContent();
    self._visualEditor.show();

    self._jstElements.hide();
    self._jstEditor.hide();
    self._preview.hide();

    self._mode = mode;
    self._defaultMode.set(mode);
    break;
  case 'preview':
    self._setPreview();
    self._preview.show();
    self._jstEditor.show();

    self._jstElements.hide();
    self._jstEditorTextArea.hide();
    self._visualEditor.hide();

    self._mode = mode;
    break;
  default:
    // Note text content is set by blur event.
    self._jstElements.show();
    self._jstEditorTextArea.show();
    self._jstEditor.show();

    self._visualEditor.hide();
    self._preview.hide();

    self._mode = 'text';
    self._defaultMode.set('text');
    break;
  }

  return true;
};

RedmineWysiwygEditor.prototype.updateVisualEditor = function(mode) {
  var self = this;

  if (!self._editor) return false;

  self._updateAttachmentButtonMenu();

  if (self._mode === 'visual') {
    self._setTextContent();
    self._setVisualContent();
  }

  return true;
};

RedmineWysiwygEditor.prototype.updateVisualContent = function(mode) {
  var self = this;

  if (!self._editor) return false;

  if (self._mode === 'visual') self._setVisualContent();

  return true;
};

RedmineWysiwygEditor.prototype._initTinymce = function(setting) {
  var self = this;

  var style = 'pre { padding: .5em 1em; background: #fafafa; border: 1px solid #e2e2e2; border-radius: 3px; width: auto; white-space: pre-wrap; }' +
    'code { padding: .1em .2em; background-color: rgba(0,0,0,0.04); border-radius: 3px; }' +
    'pre code { padding: 0; background: none; }' +
    'blockquote { color: #6c757d; margin: .5em 0; padding: 0 1em; border-left: 2px solid rgba(0,0,0,0.15); }' +
    'span#autocomplete { background-color: #eee; } ' +
    'span#autocomplete-delimiter { background-color: #ddd; }';

  var callback = function(editor) {
    editor.on('blur', function(e) {
      self._setTextContent();
    }).on('focus', function(e) {
      self._updateAttachmentButtonMenu();
    }).on('paste', function(e) {
      self._pasteEventHandler(e);
    }).on('dragover', function(e) {
      e.preventDefault();
    }).on('drop', function(e) {
      // Suppress data URI generated by file drop
      e.preventDefault();
    });

    self.changeMode(self._defaultMode.get());

    self._postInit();
  };

  var setup = function(editor) {
    self._editor = editor;

    var menu = self._attachmentButtonMenu = self._attachmentButtonMenuItems();

    editor.addButton('attachment', {
      type: 'menubutton',
      icon: 'newdocument',
      menu: menu,
      onPostRender: function() {
        self._attachmentButton = this;
        this.disabled(menu.length === 0);
      }
    });

    editor.addButton('code', {
      type: 'button',
      icon: 'code',
      tooltip: 'Code',
      onclick: function() {
        editor.execCommand('mceToggleFormat', false, 'code');
      }
    });
  };

  var toolbar = (self._format === 'textile') ?
      'formatselect | bold italic underline strikethrough code forecolor removeformat | link image codesample attachment | bullist numlist blockquote | alignleft aligncenter alignright | indent outdent | hr | table | undo redo' :
      self._htmlTagAllowed ?
      'formatselect | bold italic strikethrough code removeformat | link image codesample attachment | bullist numlist blockquote | alignleft aligncenter alignright | hr | table | undo redo' :
      'formatselect | bold italic strikethrough code removeformat | link image codesample attachment | bullist numlist blockquote | hr | table | undo redo';

  var autocompleteConfig = self._autocompleteIssuePath ? {
    delimiter: ['#'],
    source: function(query, process, delimiter) {
      if (query.length)
        $.getJSON(self._autocompleteIssuePath, {q: query}).done(process);
    },
    queryBy: 'label',
    renderDropdown: function() {
      return '<ul class="rte-autocomplete mce-panel mce-floatpanel mce-menu mc-animate mce-menu-align mce-in" style="display: none"></ul>';
    },
    render: function(item) {
      return '<li class="mce-menu-item mce-menu-item-normal">' + item.label + '</li>';
    },
    insert: function(item) {
      return '#' + item.id + ' ';
    }
  } : {};

  tinymce.init($.extend({
    // Configurable parameters
    language: self._language,
    content_style: style,
    height: Math.max(self._jstEditorTextArea.height(), 200),
    branding: false,
    plugins: 'link image lists hr table textcolor codesample paste mention',
    menubar: false,
    toolbar: toolbar,
    toolbar_items_size: 'small',
    convert_urls: false,
    invalid_styles: {
      'table': 'width height',
      'tr': 'width height',
      'th': 'width height',
      'td': 'width height'
    },
    table_appearance_options: false,
    table_advtab: false,
    table_cell_advtab: false,
    table_row_advtab: false,
    table_default_styles: {},
    codesample_dialog_height: $(window).height() * 0.85,
    codesample_languages: self._codeLanguages()
  }, setting, {
    // Mandatory parameters
    target: self._visualEditor.find('div')[0],
    init_instance_callback: callback,
    setup: setup,
    indentation : '1em',
    protect: [/<notextile>/g, /<\/notextile>/g],
    invalid_elements: 'fieldset,colgroup',
    mentions: autocompleteConfig
  }));
};

RedmineWysiwygEditor.prototype._attachmentButtonMenuItems = function() {
  var self = this;

  return self._attachment.filter(function(file) {
    return file.match(/\.(jpeg|jpg|png|gif)$/i);
  }).map(function(file) {
    return {
      text: file,
      onclick: function() {
        self._insertImage(file);
        self._setTextContent();
        self._setVisualContent();
      }
    };
  });
};

RedmineWysiwygEditor.prototype._updateAttachmentButtonMenu = function() {
  var self = this;
  var button = self._attachmentButton;

  var menu = self._attachmentButtonMenuItems();

  self._attachmentButtonMenu.length = 0;
  menu.forEach(function(file) {
    self._attachmentButtonMenu.push(file);
  });

  // Note this is unofficial solution.
  if (button.menu) {
    button.menu.remove();
    button.menu = null;
  }

  button.disabled(menu.length === 0);
};

RedmineWysiwygEditor.prototype._pasteEventHandler = function(e) {
  var self = this;

  var blockEventPropagation = function(event) {
    event.stopPropagation();
    event.preventDefault();
  };

  var data = e.clipboardData;

  if (data) {
    var isImage = (data.types.length === 1) && (data.types[0] === 'Files') &&
        data.items && (data.items[0].type.indexOf('image') >= 0);

    if (isImage) {
      blockEventPropagation(e);
      self._pasteImage(data.items[0]);
    } else if (data.types.length === 0) {
      // Do nothing if file is pasted.
      blockEventPropagation(e);
    }
  }
  else {
    // FIXME: Please tell me how to detect image or not in IE...
    var isImage = (window.clipboardData.getData('Text') === null);

    if (isImage) {
      // Can not do anything against IE.
      blockEventPropagation(e);
    }
  }
}

RedmineWysiwygEditor.prototype._pasteImage = function(dataTransferItem) {
  var self = this;

  var date = new Date();
  var name =
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      '-' +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2) +
      '-' +
      ('00' + date.getMilliseconds()).slice(-3) +
      '.png';

  var image;

  // Note we can not use:
  // - DataTransferItem in Safari and IE.
  // - File constructor in Edge and IE.
  try {
    var file = dataTransferItem.getAsFile();

    // Creates a new File object in order to set file name.
    image = new File([file], name, { type: file.type });
  } catch (e) {
    return;
  }

  if (self._attachmentUploader(image)) self._insertImage(name);
};

RedmineWysiwygEditor.prototype._setVisualContent = function() {
  var self = this;

  var previewData = function(textarea) {
    var params = [$.param($("input[name^='attachments']"))];

    var escapeTextile = function(data) {
      return data
        .replace(/&#([1-9][0-9]*);/g, '&$$#$1;')
        .replace(/<code>\n?/g, '<code>')
        .replace(/<code\s+class="(\w+)">\n?/g, '<code class="$$$1">')
        .replace(/<notextile>/g, '<$$notextile><notextile>')
        .replace(/<\/notextile>/g, '</notextile></$$notextile>')
        .replace(/\[(\d+)\]/g, '[$$$1]')
        .replace(/^fn(\d+)\.\s/mg, 'fn$$$1. ');
    };

    var escapeMarkdown = function(data) {
      return data
        .replace(/^~~~ *(\w+)([\S\s]+?)~~~$/mg, '~~~\n$1+-*/!?$2~~~')
        .replace(/^``` *(\w+)([\S\s]+?)```$/mg, '~~~\n$1+-*/!?$2~~~');
    };

    var escapeText = (self._format === 'textile') ?
        escapeTextile : escapeMarkdown;

    var name = self._oldPreviewAccess ? textarea[0].name : 'text';

    var data = {};
    data[name] =
      escapeText(textarea[0].value.replace(/\$/g, '$$$$'))
      .replace(/\{\{/g, '{$${')
      .replace(/\[\[/g, '[$$[')
      .replace(/attachment:/g, 'attachment$$:')
      .replace(/commit:/g, 'commit$$:')
      .replace(/document:/g, 'document$$:')
      .replace(/export:/g, 'export$$:')
      .replace(/forum:/g, 'forum$$:')
      .replace(/message:/g, 'message$$:')
      .replace(/news:/g, 'news$$:')
      .replace(/project:/g, 'project$$:')
      .replace(/sandbox:/g, 'sandbox$$:')
      .replace(/source:/g, 'source$$:')
      .replace(/user:/g, 'user$$:')
      .replace(/version:/g, 'versioin$$:')
      .replace(/#([1-9][0-9]*((#note)?-[1-9][0-9]*)?(\s|$))/g, '#$$$1')
      .replace(/r([1-9][0-9]*(\s|$))/g, 'r$$$1')
      + '\n\n&nbsp;'; // Append NBSP to suppress 'Nothing to preview'

    params.push($.param(data));

    return params.join('&');
  }

  var htmlContent = function(data) {
    var unescapeHtmlTextile = function(data) {
      return data;
    };

    var unescapeHtmlMarkdown = function(data) {
      return data.replace(/<pre>(\w+)\+\-\*\/\!\?([\S\s]+?)<\/pre>/g,
                          '<pre data-code="$1">$2</pre>');
    };

    var unescapeHtml = (self._format === 'textile') ?
        unescapeHtmlTextile : unescapeHtmlMarkdown;

    // FIXME: Lost if exists in PRE.
    return unescapeHtml(data)
      .replace(/\$(.)/g, '$1')
      .replace(/<legend>.+<\/legend>/g, '')
      .replace(/<a name=.+?><\/a>/g, '')
      .replace(/<a href="#.+?>.+<\/a>/g, '');
  }

  $.ajax({
    type: 'POST',
    url: self._previewUrl,
    data: previewData(self._jstEditorTextArea),
    success: function(data) {
      self._editor.setContent(htmlContent(data));
    }
  });
};

RedmineWysiwygEditor.prototype._insertImage = function(path) {
  var self = this;

  if (!self._editor) return false;

  var content = (self._format === 'textile') ?
      '!' + path + '!' : '![](' + path + ')';

  self._editor.insertContent('<br>' + content + '<br>');
};

RedmineWysiwygEditor.prototype._imageUrl = function(url) {
  var self = this;

  var base = url.replace(/^.+\//, '');
  var dir = url.replace(/\/[^\/]*$/, '')

  return (dir.match(/\/attachments\/download\/\d+$/) &&
          (self._attachment.indexOf(base) >= 0)) ? base : url;
}

RedmineWysiwygEditor.prototype._gluableContent = function(content, node, glue) {
  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var c = [];

  var p = node.previousSibling;
  var n = node.nextSibling;

  if (p && (((p.nodeType === TEXT_NODE) && /\S$/.test(p.nodeValue)) ||
            ((p.nodeType === ELEMENT_NODE) && (p.nodeName !== 'BR'))))
    c.push(glue);

  c.push(content);

  if (n && (((n.nodeType === TEXT_NODE) && /^\S/.test(n.nodeValue)) ||
            ((n.nodeType === ELEMENT_NODE) && (n.nodeName !== 'BR'))))
      c.push(glue);

  return c.join('');
};

RedmineWysiwygEditor.prototype._setTextContent = function() {
  var self = this;

  var html = self._editor.getContent();

  var text = (self._format === 'textile') ?
      self._toTextTextile(html) :
      self._toTextMarkdown(html);

  self._jstEditorTextArea.val(text);
};

RedmineWysiwygEditor.prototype._toTextTextile = function(content) {
  var self = this;

  var colorRgbToHex = function(str) {
    // RedCloth does not allow CSS function.
    return str
      .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, function(s, r, g, b) {
        return '#' + [r, g, b].map(function(x) {
          return ('0' + parseInt(x).toString(16)).slice(-2);
        }).join('');
      });
  };

  var styles = function(node) {
    var attr = {};

    // Defined in redcloth3.rb
    var STYLES_RE = /^(color|width|height|border|background|padding|margin|font|float)(-[a-z]+)*:\s*((\d+%?|\d+px|\d+(\.\d+)?em|#[0-9a-f]+|[a-z]+)\s*)+$/i;

    // FIXME: Property cssText depends on the browser.
    colorRgbToHex(node.style.cssText)
      .split(/\s*;\s*/)
      .filter(function(value) {
        return STYLES_RE.test(value);
      }).forEach(function(str) {
        var val = str.split(/\s*:\s*/);

        attr[val[0]] = val[1];
      });

    return attr;
  };

  var styleAttr = function(node) {
    var attr = styles(node);

    // For image resizing
    ['width', 'height'].forEach(function(name) {
      var val = node.getAttribute(name);

      if (val) attr[name] = val + 'px';
    });

    var style = Object.keys(attr).map(function(key) {
      return key + ': ' + attr[key] + ';';
    }).sort().join(' ');

    return (style.length > 0) ? '{' + style + '}' : '';
  };

  var img = function(node) {
    var alt = node.alt ? '(' + node.alt + ')' : '';

    return '!' + styleAttr(node) + self._imageUrl(node.src) + alt + '!';
  };

  var tableCellOption = function(node) {
    var attr = [];

    if ((node.nodeName === 'TH') ||
        (node.parentNode.parentNode.nodeName === 'THEAD')) attr.push('_');

    if (node.colSpan > 1) attr.push('\\' + node.colSpan);
    if (node.rowSpan > 1) attr.push('/' + node.rowSpan);

    if (node.style.textAlign === 'center') attr.push('=');
    else if (node.style.textAlign === 'right') attr.push('>');
    else if (node.style.textAlign === 'left') attr.push('<');

    if (node.style.verticalAlign === 'top') attr.push('^');
    else if (node.style.verticalAlign === 'bottom') attr.push('~');

    var style = styleAttr(node);

    if (style.length > 0) attr.push(style);

    return (attr.length > 0) ? attr.join('') + '.' : '';
  };

  var gluableContent = self._gluableContent;

  var NT = '<notextile></notextile>';

  var converters = [{
    filter: 'br',
    replacement: function(content) {
      return content + '\n';
    }
  }, {
    // Underline
    filter: function(node) {
      var name = node.nodeName;

      return (name === 'U') ||
        ((name === 'SPAN') && (node.style.textDecoration === 'underline'));
    },
    replacement: function(content, node) {
      return gluableContent('+' + styleAttr(node) + content + '+', node, NT);
    }
  }, {
    // Strike-through
    filter: function(node) {
      var name = node.nodeName;

      return (name === 'S') ||
        ((name === 'SPAN') && (node.style.textDecoration === 'line-through'));
    },
    replacement: function(content, node) {
      return gluableContent('-' + styleAttr(node) + content + '-', node, NT);
    }
  }, {
    // Span
    filter: 'span',
    replacement: function(content, node) {
      // Remove percentage value because RedCloth3 can't parse correctly.
      var attr = styleAttr(node).replace(/\s*\d+%/g, '');

      return ((attr.length > 0) && (content.length > 0) &&
              (node.parentNode.nodeName !== 'SPAN')) ?
        gluableContent('%' + attr + content + '%', node, NT) : content;
    }
  }, {
    // Bold
    filter: ['strong', 'b', 'mark'],
    replacement: function(content, node) {
      return gluableContent('*' + styleAttr(node) + content + '*', node, NT);
    }
  }, {
    // Italic
    filter: ['em', 'q'],
    replacement: function(content, node) {
      return gluableContent('_' + styleAttr(node) + content + '_', node, NT);
    }
  }, {
    // Image
    filter: 'img',
    replacement: function(content, node) {
      return img(node);
    }
  }, {
    // Image link
    filter: function(node) {
      return (node.nodeName === 'A') && node.firstChild &&
        (node.firstChild.nodeName === 'IMG');
    },
    replacement: function(content, node) {
      return gluableContent(img(node.firstChild) + ':' + node.href, node, ' ');
    }
  }, {
    // Anchor
    filter: function(node) {
      return (node.nodeName === 'A') && (node.textContent.length === 0);
    },
    replacement: function(content) {
      return '';
    }
  }, {
    // Link
    filter: function(node) {
      return (node.nodeName === 'A') && node.getAttribute('href');
    },
    replacement: function(content, node) {
      var href = node.getAttribute('href');

      var isAutoLink = href &&
          ((href === 'mailto:' + content) ||
           (/^(http|https|ftp|ftps):/.test(href) &&
            ((href === content) || (href === content + '/'))));

      if (isAutoLink && !node.title) {
        return gluableContent(content, node, ' ');
      } else {
        var titlePart = node.title ? ' (' + node.title + ')' : '';
        var c = '\"' + content +  titlePart + '\":' + href;

        return gluableContent(c, node, NT);
      }
    }
  } , {
    // Abbrev
    filter: 'abbr',
    replacement: function(content, node) {
      return content + '(' + node.title + ')';
    }
  }, {
    // Line
    filter: 'hr',
    replacement: function(content) {
      return '---';
    }
  }, {
    // Code
    filter: ['code', 'kbd', 'samp', 'tt', 'var'],
    replacement: function(content, node) {
      return (node.parentNode.nodeName === 'PRE') ?
        content : gluableContent('@' + content + '@', node, ' ');
    }
  }, {
    // Preformatted
    filter: 'pre',
    replacement: function(content, node) {
      if (node.firstChild && (node.firstChild.nodeName === 'CODE')) {
        var code = node.firstChild.className;
        var lang = node.className.match(/language-(\S+)/);

        var klass = code ? code :
            lang ? self._languageClassName(lang[1]) : null;

        var attr = klass ? ' class="' + klass + '"' : '';

        return '\n\n<pre><code' + attr + '>\n' +
          content.replace(/\s?$/, '\n') + '</code></pre>\n\n';
      }
      else {
        return '\n\n<pre>\n' + content + '</pre>\n\n';
      }
    }
  }, {
    // Quote
    filter: 'blockquote',
    replacement: function(content) {
      return content.trim().replace(/\n\n\n+/g, '\n\n').replace(/^/mg, '> ');
    }
  }, {
    // Table
    filter: ['table'],
    replacement: function(content, node) {
      var style = styleAttr(node);
      var attr = (style.length > 0) ? 'table' + style + '.\n' : '';

      return attr + content + '\n';
    }
  }, {
    // Table
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function(content) {
      return content;
    }
  }, {
    // Table
    filter: 'tr',
    replacement: function(content, node) {
      var style = styleAttr(node);
      var attr = (style.length > 0) ? style + '. ' : '';

      return attr + '|' + content + '\n';
    }
  }, {
    // Table
    filter: ['th', 'td'],
    replacement: function(content, node) {
      return tableCellOption(node) + ' ' +
        content.replace(/\n\n+/g, '\n') + ' |';
    }
  }, {
    // Paragraph in table
    filter: function(node) {
      return (node.nodeName === 'P') && ($(node).closest('table').length > 0);
    },
    replacement: function(content, node) {
      return content;
    }
  }, {
    // Block
    filter: [
      'div', 'address', 'article', 'aside', 'footer', 'header', 'nav',
      'section', 'dl', 'dt', 'figcaption', 'figure', 'label', 'legend',
      'option', 'progress', 'textarea', 'dialog', 'summary', 'center'
    ],
    replacement: function(content) {
      return content + '\n\n';
    }
  }, {
    // Content
    filter: [
      'hgroup', 'dd', 'main', 'bdi', 'bdo', 'cite', 'data', 'dfn',
      'ruby', 'small', 'time', 'audio', 'track', 'video', 'picture', 'caption',
      'button', 'datalist', 'fieldset', 'form', 'meter', 'optgroup', 'select',
      'details', 'big'
    ],
    replacement: function(content, node) {
      return content;
    }
  }, {
    // None
    filter: [
      'rp', 'rt', 'rtc', 'wbr', 'area', 'map', 'embed', 'object', 'param',
      'source', 'canvas', 'noscript', 'script', 'input', 'output'
    ],
    replacement: function(content, node) {
      return '';
    }
  }];

  return toTextile(content, {
    converters: converters,
    ignorePotentialOlTriggers: true
  });
};

RedmineWysiwygEditor.prototype._toTextMarkdown = function(content) {
  var self = this;

  if (!self._markdown) self._markdown = self._initMarkdown();

  return self._markdown.turndown(content);
};

RedmineWysiwygEditor.prototype._initMarkdown = function() {
  var self = this;

  var turndownService = new TurndownService({
    headingStyle: 'atx'
  });

  // Overrides the method to disable escaping.
  turndownService.escape = function(string) {
    return string;
  };

  turndownService.use(turndownPluginGfm.tables);

  turndownService.addRule('br', {
    // Suppress appending two spaces at the end of the line.
    filter: 'br',
    replacement: function(content, node) {
      return ($(node).closest('table').length > 0) ? ' ' : '\n';
    }
  }).addRule('div', {
    filter: function(node) {
      return (node.nodeName === 'DIV') && node.style.cssText.length;
    },
    replacement: function(content, node) {
      return '<div style="' + node.style.cssText + '">\n' + content +
        '\n</div>\n';
    }
  }).addRule('p', {
    filter: function(node) {
      return (node.nodeName === 'P') && node.style.cssText.length;
    },
    replacement: function(content, node) {
      return '<p style="' + node.style.cssText + '">' + content + '</p>\n';
    }
  }).addRule('span', {
    filter: function(node) {
      return (node.nodeName === 'SPAN') && node.style.cssText.length;
    },
    replacement: function(content, node) {
      return '<span style="' + node.style.cssText + '">' + content + '</span>';
    }
  }).addRule('bold', {
    filter: 'mark',
    replacement: function(content, node) {
      return '**' + content + '**';
    }
  }).addRule('italic', {
    filter: 'q',
    replacement: function(content) {
      return '_' + content + '_';
    }
  }).addRule('underline', {
    filter: function(node) {
      var name = node.nodeName;

      return (name === 'U') || (name === 'INS') ||
        ((name === 'SPAN') && (node.style.textDecoration === 'underline'));
    },
    replacement: function(content, node) {
      return '<ins>' + content + '</ins>';
    }
  }).addRule('strikethrough', {
    filter: function(node) {
      var name = node.nodeName;

      return (name === 'S') || (name === 'DEL') ||
        ((name === 'SPAN') && (node.style.textDecoration === 'line-through'));
    },
    replacement: function(content) {
      return '~~' + content + '~~';
    }
  }).addRule('del', {
    filter: 'del',
    replacement: function(content) {
      return '~~' + content + '~~';
    }
  }).addRule('code', {
    filter: ['kbd', 'samp', 'tt', 'var'],
    replacement: function(content) {
      return gluableContent('`' + content + '`', node, ' ');
    }
  }).addRule('a', {
    filter: function(node) {
      var content = node.textContent;
      var href = node.getAttribute('href');

      return (node.nodeName === 'A') && href &&
        ((href === 'mailto:' + content) ||
         (/^(http|https|ftp|ftps):/.test(href) &&
          ((href === content) || (href === content + '/'))));
    },
    replacement: function(content, node) {
      return self._gluableContent(content, node, ' ');
    }
  }).addRule('table', {
    filter: 'table',
    replacement: function(content) {
      return content;
    }
  }).addRule('pTable', {
    // Paragraph in table
    filter: function(node) {
      return (node.nodeName === 'P') && ($(node).closest('table').length > 0);
    },
    replacement: function(content) {
      return content;
    }
  }).addRule('pre', {
    filter: 'pre',
    replacement: function(content, node) {
      var code = node.dataset.code;
      var lang = node.className.match(/language-(\S+)/);

      var klass = code ? code :
          lang ? self._languageClassName(lang[1]) : null;

      var opt = klass ? ' ' + klass : '';

      return '~~~' + opt + '\n' + content.replace(/\n?$/, '\n') + '~~~\n\n';
    }
  }).addRule('blockquote', {
    filter: 'blockquote',
    replacement: function(content) {
      return content.trim().replace(/\n\n\n+/g, '\n\n').replace(/^/mg, '> ');
    }
  }).addRule('img', {
    filter: 'img',
    replacement: function(content, node) {
      return '![' + node.alt + '](' + self._imageUrl(node.src) + ')';
    }
  }).addRule('block', {
    filter: [
      'address', 'article', 'aside', 'footer', 'header', 'nav',
      'section', 'dl', 'dt', 'figcaption', 'figure', 'label', 'legend',
      'option', 'progress', 'textarea', 'dialog', 'summary', 'center'
    ],
    replacement: function(content) {
      return content + '\n\n';
    }
  }).addRule('content', {
    filter: [
      'hgroup', 'dd', 'main', 'bdi', 'bdo', 'cite', 'data', 'dfn',
      'ruby', 'small', 'time', 'audio', 'track', 'video', 'picture', 'caption',
      'button', 'datalist', 'fieldset', 'form', 'meter', 'optgroup', 'select',
      'details', 'big', 'abbr'
    ],
    replacement: function(content, node) {
      return content;
    }
  }).addRule('none', {
    filter: [
      'rp', 'rt', 'rtc', 'wbr', 'area', 'map', 'embed', 'object', 'param',
      'source', 'canvas', 'noscript', 'script', 'input', 'output'
    ],
    replacement: function(content, node) {
      return '';
    }
  }).keep(['sup', 'sub']);

  return turndownService;
};

RedmineWysiwygEditor.prototype._setPreview = function() {
  var self = this;

  var previewData = function(textarea) {
    var params = [$.param($("input[name^='attachments']"))];

    var name = self._oldPreviewAccess ? textarea[0].name : 'text';

    var data = {};
    data[name] = textarea[0].value + ' ';

    params.push($.param(data));

    return params.join('&');
  };

  self._preview.css('min-height', self._visualEditor.height());

  $.ajax({
    type: 'POST',
    url: self._previewUrl,
    data: previewData(self._jstEditorTextArea),
    success: function(data) {
      self._preview.html(data);
    }
  });
};

RedmineWysiwygEditor.prototype._codeLanguages = function() {
  var self = this;

  return self._oldPreviewAccess ? [
    // CodeRay (Redmine 3)
    { text: 'C', value: 'c', klass: 'c' },
    { text: 'C++', value: 'cpp', klass: 'cpp' },
    { text: 'Clojure', value: 'clojure', klass: 'clojure' },
    { text: 'CSS', value: 'css', klass: 'css' },
    { text: 'Delphi', value: 'delphi', klass: 'delphi' },
    { text: 'Diff', value: 'diff', klass: 'diff' },
    { text: 'ERB', value: 'erb', klass: 'erb' },
    { text: 'Go', value: 'go', klass: 'go' },
    { text: 'Groovy', value: 'groovy', klass: 'groovy' },
    { text: 'Haml', value: 'haml', klass: 'haml' },
    { text: 'HTML', value: 'markup', klass: 'html' },
    { text: 'Java', value: 'java', klass: 'java' },
    { text: 'JavaScript', value: 'javascript', klass: 'javascript' },
    { text: 'JSON', value: 'json', klass: 'json' },
    { text: 'Lua', value: 'lua', klass: 'lua' },
    { text: 'PHP', value: 'php', klass: 'php' },
    { text: 'Python', value: 'python', klass: 'python' },
    { text: 'Ruby', value: 'ruby', klass: 'ruby' },
    { text: 'Sass', value: 'sass', klass: 'sass' },
    { text: 'SQL', value: 'sql', klass: 'sql' },
    { text: 'TaskPaper', value: 'taskpaper', klass: 'taskpaper' },
    { text: 'Text', value: 'text', klass: 'text' },
    { text: 'XML', value: 'xml', klass: 'xml' },
    { text: 'YAML', value: 'yaml', klass: 'yaml' }
  ] : [
    // Rouge (Redmine 4)
    { text: 'C', value: 'c', klass: 'c' },
    { text: 'C++', value: 'cpp', klass: 'cpp' },
    { text: 'C#', value: 'csharp', klass: 'csharp' },
    { text: 'CSS', value: 'css', klass: 'css' },
    { text: 'Diff', value: 'diff', klass: 'diff' },
    { text: 'Go', value: 'go', klass: 'go' },
    { text: 'Groovy', value: 'groovy', klass: 'groovy' },
    { text: 'HTML', value: 'markup', klass: 'html' },
    { text: 'Java', value: 'java', klass: 'java' },
    { text: 'JavaScript', value: 'javascript', klass: 'javascript' },
    { text: 'Objective C', value: 'objc', klass: 'objc' },
    { text: 'Perl', value: 'perl', klass: 'perl' },
    { text: 'PHP', value: 'php', klass: 'php' },
    { text: 'Python', value: 'python', klass: 'python' },
    { text: 'R', value: 'r', klass: 'r' },
    { text: 'Ruby', value: 'ruby', klass: 'ruby' },
    { text: 'Sass', value: 'sass', klass: 'sass' },
    { text: 'Scala', value: 'scala', klass: 'scala' },
    { text: 'Shell', value: 'bash', klass: 'shell' },
    { text: 'SQL', value: 'sql', klass: 'sql' },
    { text: 'Swift', value: 'swift', klass: 'swift' },
    { text: 'XML', value: 'xml', klass: 'xml' },
    { text: 'YAML', value: 'yaml', klass: 'yaml' }
  ];
};

RedmineWysiwygEditor.prototype._languageClassName = function(lang) {
  var self = this;

  var code = self._codeLanguages();

  for (var i = 0; i < code.length; i++) {
    if (code[i].value === lang) return code[i].klass;
  }

  return null;
};
