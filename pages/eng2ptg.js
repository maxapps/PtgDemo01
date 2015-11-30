var ptgLib = require('../js/PtgLib');
var uiLib = require('../js/UILib').create();

exports.create = function() {

//cordova plugin add cordova-plugin-nativeaudio

  var _page = tabris.create('Page', {
    title: 'English to Portuguese',
    topLevel: true
  });

  uiLib.createUI('initial', _page, 'e2p');
  
  _page.on('appear', function() {
    ptgLib.mode('e2p');
    ptgLib.nextWord();
    uiLib.setQuestion(ptgLib.question());
  });


  return _page;
};