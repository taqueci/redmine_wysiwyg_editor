function RedmineWysiwygEditor(jstEditor, previewUrl) {
	this._jstEditor = jstEditor;
	this._previewUrl = previewUrl;

	this._format = 'textile';
	this._language = 'en';
	this._i18n = {
		textile: 'Textile',
		markdown: 'Markdown',
		visual: 'Visual editor',
		preview: 'Preview'
	};
	this._attachments = [];

	this._defaultModeKey = 'redmine-wysiwyg-editor-mode';
}

RedmineWysiwygEditor.prototype.setFormat = function(format) {
	this._format = format;
}

RedmineWysiwygEditor.prototype.setLanguage = function(lang) {
	var option = ['af_ZA', 'ar', 'be', 'bg_BG', 'bn_BD', 'ca', 'cs', 'cs_CZ', 'cy', 'da', 'de', 'de_AT', 'dv', 'el', 'en_CA', 'en_GB', 'es', 'es_MX', 'et', 'eu', 'fa_IR', 'fi', 'fr_FR', 'ga', 'gl', 'he_IL', 'hr', 'hu_HU', 'id', 'it', 'ja', 'ka_GE', 'kab', 'kk', 'km_KH', 'ko_KR', 'lt', 'lv', 'nb_NO', 'nl', 'pl', 'pt_BR', 'pt_PT', 'ro', 'ru', 'sk', 'sl_SI', 'sr', 'sv_SE', 'ta', 'ta_IN', 'th_TH', 'tr', 'tr_TR', 'ug', 'uk', 'uk_UA', 'uz', 'vi_VN', 'zh_CN', 'zh_TW'];

	var language = lang.replace(/-.+/, function(match, offset, string)  {
		return match.toUpperCase().replace('-', '_');
	});

	this._language = (option.indexOf(language) >= 0) ? language : 'en';
}

RedmineWysiwygEditor.prototype.setI18n = function(data) {
	this._i18n = data;
}

RedmineWysiwygEditor.prototype.setAttachments = function(files) {
	this._attachment = files;
}

RedmineWysiwygEditor.prototype.init = function() {
	var self = this;

	var container = self._jstEditor.parent();

	if (container.find('.wysiwyg-editor').length > 0) return;

	self._jstElements = container.find('.jstElements');
	self._jstEditorTextArea = self._jstEditor.find('textarea');

	var date = new Date();
	self._id = 'wysiwyg-editor-' + self._jstEditorTextArea.attr('id') +
		'-' + date.getTime();

	var editorHtml = '<div class="wysiwyg-editor">' +
		'<textarea id="' + self._id + '" class="wysiwyg-editor-textarea">' +
		'</div>';

	self._jstEditor.after(editorHtml);

	self._visualEditor = container.find('.wysiwyg-editor');
	self._visualEditor.hide();

	var previewHtml = '<div class="wysiwyg-editor-preview wiki"></div>';

	self._visualEditor.after(previewHtml);

	self._preview = container.find('.wysiwyg-editor-preview');
	self._preview.hide();

	var editorTabHtml = '<div class="wysiwyg-editor-tab"><ul>' +
		'<li><a href="#" data-type="text" class="active">' +
		self._i18n[self._format] + '</a></li>' +
		'<li><a href="#" data-type="visual">' +
		self._i18n.visual + '</a></li>' +
		'<li><a href="#" data-type="preview">' +
		self._i18n.preview + '</a></li>' +
		'</ul></div>';

	self._preview.after(editorTabHtml);

	self._editorTab = container.find('.wysiwyg-editor-tab');
	self._editorTab.on('click', 'li a', function(e) {
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

	self._initTinymce();
}

RedmineWysiwygEditor.prototype.changeMode = function(mode) {
	var self = this;

	self._editorTab.find('li a').each(function() {
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

		self._defaultMode.set('visual');
		break;
	case 'preview':
		self._setPreview();
		self._preview.show();

		self._jstElements.hide();
		self._jstEditor.hide();
		self._visualEditor.hide();
		break;
	default:
		// Note text content is set by blur event.
		self._jstElements.show();
		self._jstEditor.show();

		self._visualEditor.hide();
		self._preview.hide();

		self._defaultMode.set('text');
		break;
	}
}

RedmineWysiwygEditor.prototype._initTinymce = function() {
	var self = this;

	var callback = function(editor) {
		editor.on('blur', function(e) {
			self._setTextContent();
		});

		editor.on('focus', function(e) {
			self._updateImageButtonMenu();
		});
	};

	var setup = function(editor) {
		self._editor = editor;

		var menu = self._imageButtonMenuItems();

		self._imageButtonMenu = menu;

		editor.addButton('insertimage', {
			type: 'menubutton',
			icon: 'image',
			menu: menu,
			onPostRender: function() {
				self._imageButton = this;
				this.disabled(menu.length == 0);

				self.changeMode(self._defaultMode.get());
			}
		});
	};

	tinymce.init({
		selector: '#' + self._id,
		language: self._language,
		height: self._jstEditorTextArea.height(),
		branding: false,
		plugins: 'link lists hr table',
		menubar: false,
		toolbar: 'formatselect | bold italic underline strikethrough | link insertimage | bullist numlist blockquote | alignleft aligncenter alignright | hr | table | undo redo',
		table_appearance_options: false,
		toolbar_items_size: 'small',
		table_advtab: false,
		table_cell_advtab: false,
		table_row_advtab: false,
		init_instance_callback: callback,
		setup: setup,
		invalid_elements: 'fieldset'
	});
}

RedmineWysiwygEditor.prototype._imageButtonMenuItems = function() {
	var self = this;

	return self._attachment.filter(function(file) {
		return file.match(/\.(jpeg|jpg|png|gif)$/i);
	}).map(function(file) {
		var content = (self._format == 'textile') ?
			'!' + file + '!' : '![](' + file + ')';

		return {
			text: file,
			onclick: function() {
				self._editor.insertContent(content);
				self._setTextContent();
				self._setVisualContent();
			}
		};
	});
}

RedmineWysiwygEditor.prototype._updateImageButtonMenu = function() {
	var self = this;
	var button = self._imageButton;

	var menu = self._imageButtonMenuItems();

	self._imageButtonMenu.length = 0;
	menu.forEach(function(file) {
		self._imageButtonMenu.push(file);
	});

	// Note this is unofficial solution.
	if (button.menu) {
		button.menu.remove();
		button.menu = null;
	}

	button.disabled(menu.length == 0);
}

RedmineWysiwygEditor.prototype._setVisualContent = function() {
	var self = this;

	var previewData = function(textarea) {
		var params = [$.param($("input[name^='attachments']"))];

		var escapeTextile = function(data) {
			return data.replace(/<code class="/g, '<code class="$$');
		};

		var escapeMarkdown = function(data) {
			return data.replace(/^~~~ *(\w+)([\S\s]+?)~~~$/mg,
								'~~~\n$1+-*/!?$2~~~');
		};

		var escapeText = (self._format == 'textile') ?
			escapeTextile : escapeMarkdown;

		var data = {};
		data[textarea[0].name] =
			escapeText(textarea[0].value.replace(/\$/g, '$$$$'))
			.replace(/\{\{/g, '{$${')
			.replace(/\[\[/g, '[$$[')
			.replace(/attachment:/g, 'attachment$$:')
			.replace(/commit:/g, 'commit$$:')
			.replace(/source:/g, 'source$$:')
			.replace(/forum:/g, 'forum$$:')
			.replace(/news:/g, 'news$$:')
			.replace(/project:/g, 'project$$:')
			.replace(/user:/g, 'user$$:')
			.replace(/document:/g, 'document$$:')
			.replace(/version:/g, 'versioin$$:')
			.replace(/export:/g, 'export$$:')
			.replace(/#([1-9][0-9]*)/g, '#$$$1')
			.replace(/r([1-9][0-9]*)/g, 'r$$$1')
			.replace(/^>/mg, '$$>')
			+ ' ';

		params.push($.param(data));

		return params.join('&');
	}

	var htmlContent = function(data) {
		var unescapeHtmlTextile = function(data) {
			return data;
		}

		var unescapeHtmlMarkdown = function(data) {
			return data.replace(/<pre>(\w+)\+\-\*\/\!\?([\S\s]+?)<\/pre>/g,
								'<pre data-code="$1">$2</pre>');
		}

		var unescapeHtml = (self._format == 'textile') ?
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
}

RedmineWysiwygEditor.prototype._setTextContent = function() {
	var self = this;

	var html = self._editor.getContent();

	var text = (self._format == 'textile') ?
		self._toTextTextile(html) :
		self._toTextMarkdown(html);

	self._jstEditorTextArea.val(text);
}

RedmineWysiwygEditor.prototype._toTextTextile = function(content) {
	var self = this;

	return toTextile(content, {
		converters: [{
			filter: function(node) {
				return node.nodeName == 'SPAN' &&
					node.style.textDecoration == 'underline';
			},
			replacement: function(content) {
				return '+' + content + '+';
			}
		}, {
			filter: function(node) {
				return node.nodeName == 'SPAN' &&
					node.style.textDecoration == 'line-through';
			},
			replacement: function(content) {
				return '-' + content + '-';
			}
		}, {
			filter: 'hr',
			replacement: function(content) {
				return '---';
			}
		}, {
			filter: 'table',
			replacement: function(content) {
				return self._tableTextile(content) + "\n\n";
			}
		}, {
			filter: 'pre',
			replacement: function(content) {
				return '<pre>' + content + '</pre>';
			}
		}, {
			filter: 'img',
			replacement: function(content, node) {
				var src = node.src;
				var path = src.match(/\/attachments\/download\//) ?
					src.replace(/^.+\//, '') : src;

				var style = node.style.cssText;
				var attr = style ? '{' + style + '}' : '';

				return '!' + attr + path + '!';
			}
		}]
	});
}

RedmineWysiwygEditor.prototype._tableTextile = function(content) {
	var output = [];

	var table = document.createElement('table');
	table.style.display = 'none';
	table.innerHTML = content.replace(/[\r\n\t]/g, '');

	document.body.appendChild(table);

	var row = table.getElementsByTagName('tr');

	for (var i = 0; i < row.length; i++) {
		var val = [];
		var col = row[i].children;

		for (var j = 0; j < col.length; j++) {
			var cell = col[j];

			var style = (cell.nodeName == 'TH') ? '_.'
				: (cell.style.textAlign == 'center') ? '=.'
				: (cell.style.textAlign == 'right')  ? '>.'
				: (cell.style.textAlign == 'left')   ? '<.'
				: '';

			val.push(style + ' ' + cell.innerText + ' ');
		}

		output.push('|' + val.join('|') + '|');
	}

	document.body.removeChild(table);

	return output.join("\n");
}

RedmineWysiwygEditor.prototype._toTextMarkdown = function(content) {
	var self = this;

	if (!self._markdown) self._markdown = self._initMarkdown();

	// FIXME: How can I suppress backslash escapes?
	return self._markdown.turndown(content).replace(/\\(.)/g, '$1');
}

RedmineWysiwygEditor.prototype._initMarkdown = function() {
	var turndownService = new TurndownService();

	turndownService.use(turndownPluginGfm.tables);

	turndownService.addRule('strikethrough', {
		filter: 'del',
		replacement: function(content) {
			return '~~' + content + '~~';
		}
	});

	turndownService.addRule('table', {
		filter: 'table',
		replacement: function(content) {
			return content;
		}
	});

	turndownService.addRule('pre', {
		filter: 'pre',
		replacement: function(content, node) {
			var code = node.dataset.code;
			var s = code ? ' ' + code : '';

			return '~~~' + s + '\n' + content + '~~~\n\n';
		}
	});

	turndownService.addRule('img', {
		filter: 'img',
		replacement: function(content, node) {
			var src = node.src;
			var path = src.match(/\/attachments\/download\//) ?
				src.replace(/^.+\//, '') : src;

			return '![' + node.alt + '](' + path + ')';
		}
	});

	return turndownService;
}

RedmineWysiwygEditor.prototype._setPreview = function() {
	var self = this;

	var previewData = function(textarea) {
		var params = [$.param($("input[name^='attachments']"))];

		var data = {};
		data[textarea[0].name] = textarea[0].value + ' ';

		params.push($.param(data));

		return params.join('&');
	}

	$.ajax({
		type: 'POST',
		url: self._previewUrl,
		data: previewData(self._jstEditorTextArea),
		success: function(data) {
			self._preview.html(data);
		}
    });
}
