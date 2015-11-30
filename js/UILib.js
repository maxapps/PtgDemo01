var ptgLib = require('./PtgLib');

exports.create = function() {

  // PRIVATE -----------------------------------------------------------------------------------------------------------

  var _mode;
  var _page;
  var _public = {};


  // _createBtnShow()
  function _createBtnShow() {
    tabris.create('Button', {
      id: 'btnShow',
      layoutData: {centerX:0, top:['#txtInput', 20]},
      text: 'Show Answer',
    }).once('select', function() {
      _public.createUI('answer');
    }).appendTo(_page);
  }


  // _createBtnsLearn()
  function _createBtnsLearn() {
    var mComp = tabris.create('Composite', {
      id: 'cmpBtnsLearn',
      layoutData: {centerX:0, top:['#lblAnswer', 20]}
    });

    tabris.create('Button', {
      id: 'btnGotIt',
      layoutData: {left:0, top:0},
      text: 'Got It'
    }).once('select', function() {
      _nextWord('learned');
    }).appendTo(mComp);

    tabris.create('Button', {
      id: 'btnAgain',
      layoutData: {left:['#btnGotIt', 10], top:0},
      text: 'Show Again'
    }).once('select', function() {
      _nextWord('');
    }).appendTo(mComp);

    mComp.appendTo(_page);
  }


  // _createBtnsStatus()
  function _createBtnsStatus() {
    tabris.create('Button', {
      id: 'btnGood',
      layoutData: {centerX:0, top:['#lblAnswer', 20]},
      text: 'Good'
    }).once('select', function() {
      _nextWord('good');
    }).appendTo(_page);

    tabris.create('Button', {
      id: 'btnEasy',
      layoutData: {right:['#btnGood', 10], top:['#lblAnswer', 20]},
      text: 'Easy'
    }).once('select', function() {
      _nextWord('easy');
    }).appendTo(_page);

    tabris.create('Button', {
      id: 'btnHard',
      layoutData: {left:['#btnGood', 10], top:['#lblAnswer', 20]},
      text: 'Hard'
    }).once('select', function() {
      _nextWord('hard');
    }).appendTo(_page);
  }


  // _createImgAudio(oLayout)
  function _createImgAudio(oLayout) {
    tabris.create('ImageView', {
      id: 'imgAudio_' + _mode,
      image: {src:'resources/images/ic_volume_up_black_24dp.png', width:24, height:24},
      layoutData: oLayout
    }).on('tap', function() {
      ptgLib.playAudio();
    }).appendTo(_page);
  }


  // _createLblAnswer()
  function _createLblAnswer() {
    tabris.create('TextView', {
      id: 'lblAnswer',
      layoutData: {centerX:0, top:['#txtInput', 20]},
      font: '32px',
      text: ptgLib.answer(),
    }).on('tap', function() {
      ptgLib.playAudio();
    }).once('dispose', function() {
      _disposeOf(['imgAudio_e2p'])
    }).appendTo(_page);

    if (_mode == 'e2p') {
      _createImgAudio({left:['#lblAnswer', 10],  top:['#txtInput', 32]});
    }
  }


  // _createLblQuestion()
  function _createLblQuestion() {
    tabris.create('TextView', {
      id: 'lblQuestion',
      layoutData: {centerX:0, top:50},
      font: '32px',
    }).on('tap', function() {
      ptgLib.playAudio();
    }).appendTo(_page);

    if (_mode == 'p2e') {
      _createImgAudio({left:['#lblQuestion', 10],  top:62});
    }
  }


  // _createTxtInput()
  function _createTxtInput() {
    tabris.create('TextInput', {
      id: 'txtInput',
      layoutData: {left:30, top:['#lblQuestion', 20], right:30},
    }).appendTo(_page);
  }


  // _disposeOf(aCtrls)
  function _disposeOf(aCtrls) {
    aCtrls.forEach(function(sCtrl) {
      _page.find('#' + sCtrl).dispose();
    });
  }


  // _nextWord(sStatus)
  function _nextWord(sStatus) {
    if (sStatus != '') {
      ptgLib.status(sStatus);
    }

    ptgLib.nextWord();
    _public.createUI('next');
  }


  // PUBLIC ------------------------------------------------------------------------------------------------------------

  // createUI(sState[, mPage, sMode])
  // ...
  _public.createUI = function(sState, mPage, sMode) {
    _page = mPage || _page;
    _mode = _mode || sMode;

    switch (sState) {
      case 'initial':
        _createLblQuestion();
        _createTxtInput();
        _createBtnShow();
        break;
      case 'answer':
        _disposeOf(['btnShow']);
        _createLblAnswer();
        if (ptgLib.learned()) {
          _createBtnsStatus();
        } else {
          _createBtnsLearn();
        }
        break;
      case 'next':
        _disposeOf(['btnGood', 'btnEasy', 'btnHard', 'cmpBtnsLearn', 'lblAnswer']);
        _page.find('#lblQuestion').set('text', ptgLib.question());
        _page.find('#txtInput').set('text', '');
        _createBtnShow();
        break;
    }
  };


  // setQuestion(sVal)
  // ...
  _public.setQuestion = function(sVal) {
    _page.find('#lblQuestion').set('text', ptgLib.question());
  };


  return _public;

};
