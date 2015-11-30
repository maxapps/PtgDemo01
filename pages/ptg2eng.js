var ptgLib = require('../js/PtgLib');
var uiLib = require('../js/UILib').create();

exports.create = function() {

  var _page = tabris.create('Page', {
    title: 'Portuguese to English',
    topLevel: true
  });

  uiLib.createUI('initial', _page, 'p2e');
  
  _page.on('appear', function() {
    ptgLib.mode('p2e');
    ptgLib.nextWord();
    uiLib.setQuestion(ptgLib.question());
  });


  return _page;
};