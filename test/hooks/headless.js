/*
 * Setup global variables for Node.js to match browser setup.
 */
if (typeof exports === 'object') {
  exports.mochaHooks = {
    beforeAll() {
      var { JSDOM } = require('jsdom');
      var { window } = new JSDOM(
        '<!doctype html><html><head></head><body></body></html>', {
        url: 'https://example.org/',
      });

      global.chai = require('chai');

      global.window = window;
      global.document = window.document;

      global.MutationObserver = window.MutationObserver;

      window.matchMedia = () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
      });

      var tinymce = require('tinymce');
      global.tinymce = window.tinymce = tinymce;

      global.RedmineWysiwygEditor =
        require('../../assets/javascripts/RedmineWysiwygEditor');

      require('../../assets/javascripts/RedmineFormatPlugin');
    },
    afterAll() {
      delete global.chai;
      delete global.window;
      delete global.document;
      delete global.tinymce;
      delete global.MutationObserver;
      delete global.RedmineWysiwygEditor;
    },
  };
}
