/*
 * Setup global variables for Node.js to match browser setup.
 */
if (typeof exports === 'object') {
  exports.mochaHooks = {
    beforeAll() {
      global.chai = require('chai');
      var { JSDOM } = require('jsdom');
      var { window } = new JSDOM('<html><head></head><body></body></html>', {
        url: 'https://example.org/',
      });
      global.window = window;
      global.document = window.document;
      var tinymce = require('../../assets/javascripts/tinymce/tinymce.min');
      global.tinymce = window.tinymce = tinymce;
      global.RedmineWysiwygEditor = require('../../assets/javascripts/redmine_wysiwyg_editor');

      require('../../assets/javascripts/RedmineFormatPlugin');
    },
    afterAll() {
      delete global.chai;
      delete global.window;
      delete global.document;
      delete global.tinymce;
    },
  };
}
