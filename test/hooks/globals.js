/*
 * Register chai.assert as a global variable.
 */
(function () {
  var isBrowser = typeof exports !== 'object';
  var glob = isBrowser ? window : global;
  var rootHooks = {
    beforeAll() {
      glob.assert = glob.chai.assert;
    },
    afterAll() {
      delete glob.assert;
    },
  }
  if (isBrowser) {
    mocha.rootHooks(rootHooks);
  } else {
    exports.mochaHooks = rootHooks;
  }
})();
