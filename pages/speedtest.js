var ptgLib = require('../js/PtgLib');

exports.create = function() {

  var _intervalId;
  var _lblTimer;
  var _testInfo;
  var _timer;


  // _createBtnNext()
  function _createBtnNext() {
    tabris.create('Button', {
      id: 'btnNext',
      layoutData: {centerX:0, top:['#txtInput', 20]},
      text: 'NEXT',
    }).on('select', function() {
      var iCheck = ptgLib.checkSpeedTestAnswer(_page.find('#txtInput').get('text'));

      if (iCheck > 0) {
        _nextWord();
      } else {
        _showAnswer(iCheck == 0);
      }

    }).appendTo(_page);
  }


  // _createCllIncorrect()
  function _createCllIncorrect() {
    var iCount = 0;

    _testInfo.incorrectWords.unshift({e:'English', p:'Portuguese'});

    tabris.create('CollectionView', {
      id: 'cllIncorrect',
      layoutData: {top:['#lblIncorrectWords', 2], left:10, bottom:0, right:10},
      items: _testInfo.incorrectWords,
      itemHeight: 40,
      initializeCell: function(mCell) {
        var sFont = iCount == 0 ? 'bold 24px' : '22px';

        var mPtg = tabris.create('TextView', {
          layoutData: {top:2, left:'45%'},
          font: sFont,
        }).appendTo(mCell);

        if (iCount > 0) {
          _createIcon('volume_up', {top:6, left:[mPtg, 4]}, 'imgIcon_' + iCount, mCell);
        }

        var mEng = tabris.create('TextView', {
          layoutData: {top:2, left:2, right:[mPtg, 10]},
          font: sFont,
        }).appendTo(mCell);

        mCell.on('change:item', function(mWidget, oWord) {
          mEng.set('text', oWord.e);
          mPtg.set('text', oWord.p);
        });

        ++iCount;
      }
    }).appendTo(_page);
  }


  // _createIcon(sIcon, oLayout[, sId[, mParent]])
  function _createIcon(sIcon, oLayout, sId, mParent) {
    sId = sId || 'imgIcon_' + sIcon;
    mParent = mParent || _page;

    return tabris.create('ImageView', {
      id: sId,
      image: {src:'resources/images/ic_' + sIcon + '_black_24dp.png', width:24, height:24},
      layoutData: oLayout
    }).appendTo(mParent);
  }


  // _createIconLabel(sId, sText, oLayout)
  function _createIconLabel(sId, sText, oLayout) {
    return tabris.create('TextView', {
      id: sId,
      layoutData: oLayout,
      font: '22px',
      text: sText
    }).appendTo(_page);
  }


  // _createLblAnswer(bWrong)
  function _createLblAnswer(bWrong) {
    tabris.create('TextView', {
      id: 'lblAnswer',
      layoutData: {centerX:0, top:['#btnNext', 20]},
      font: '32px',
      background: bWrong ? 'initial' : 'yellow',
      textColor: bWrong ? 'red' : 'initial',
      text: _testInfo.answer
    }).appendTo(_page);
  }


  // _createLblIncorrectWords()
  function _createLblIncorrectWords() {
    var mLbl = tabris.create('TextView', {
      id: 'lblIncorrectWords',
      layoutData: {left:10, top:['#lblCorrect', 30]},
      font: 'bold 28px',
      text: 'Incorrect Words'
    }).appendTo(_page);
  }


  // _createLblQuestion()
  function _createLblQuestion() {
    tabris.create('TextView', {
      id: 'lblQuestion',
      layoutData: {centerX:0, top:['#lblCorrect', 2]},
      font: '32px',
    }).appendTo(_page);
  }


  // _createStats()
  function _createStats() {
    var mIconCnt = _createIcon('help', {top:4, left:10});
    var mLblCnt = _createIconLabel('lblCount', '0/0', {top:0, left:[mIconCnt, 5]});

    _lblTimer = _createIconLabel('lblTime', '00:00', {top:0, right:10});
    _createIcon('access_time', {top:4, right:[_lblTimer, 5]});

    var mIconInc = _createIcon('mood', {top:[mLblCnt, 10], left:10});
    _createIconLabel('lblCorrect', '0', {top:[_lblTimer, 6], left:[mIconInc, 5]});

    var mLblInc = _createIconLabel('lblIncorrect', '0', {top:[_lblTimer, 6], right:10});
    _createIcon('mood_bad', {top:[mIconCnt, 10], right:[mLblInc, 5]});
  }


  // _createTxtInput()
  function _createTxtInput() {
    tabris.create('TextInput', {
      id: 'txtInput',
      layoutData: {left:30, top:['#lblQuestion', 20], right:30},
    }).appendTo(_page);
  }


  // _createUI(bDispose)
  function _createUI(bDispose) {
    ['btnNext', 'cllIncorrect', 'lblAnswer', 'lblIncorrectWords', 'lblQuestion', 'imgIcon_help', 
        'imgIcon_access_time', 'imgIcon_mood', 'imgIcon_mood_bad', 'lblCount', 'lblTime', 'lblCorrect', 
        'lblIncorrect', 'txtInput'].forEach(function(sId) {
      _page.find('#' + sId).off().dispose();
    });

    _createLblQuestion();
    _createTxtInput();
    _createBtnNext();
    _createStats();
  }


  // _incrementTimer()
  function _incrementTimer() {
    var iMin, iSec;

    ++_timer;
    iSec = _timer % 60;
    iMin = Math.floor(_timer / 60);

    _lblTimer.set('text', (iMin < 10 ? '0' + iMin : iMin) + ':' + (iSec < 10 ? '0' + iSec : iSec));
  }


  // _nextWord()
  function _nextWord() {
    _testInfo = ptgLib.nextWord();

    if (_testInfo.finished) {
      _showFinished();
    } else {
      _page.find('#lblAnswer').dispose();
      _page.find('#btnNext').set('enabled', true);

      _page.find('#lblQuestion').set('text', _testInfo.question);
      _page.find('#txtInput').set('text', '');

      _page.find('#lblCount').set('text', _testInfo.count + '/' + _testInfo.total);
      _page.find('#lblCorrect').set('text', _testInfo.correct);
      _page.find('#lblIncorrect').set('text', _testInfo.incorrect);
    }
  }


  // _showAnswer(bWrong)
  function _showAnswer(bWrong) {
    _page.find('#btnNext').set('enabled', false);
    _createLblAnswer(bWrong);
    window.setTimeout(_nextWord, 3000);
  }


  // _showFinished()
  function _showFinished() {
    window.clearInterval(_intervalId);

    _page.find('#lblQuestion').dispose();
    _page.find('#lblAnswer').dispose();
    _page.find('#txtInput').dispose();
    _page.find('#btnNext').dispose();

    _page.find('#imgIcon_help').set('image', {src:'resources/images/ic_grade_black_24dp.png', width:24, height:24});
    _page.find('#lblCount').set('text', _testInfo.score);
    _page.find('#lblCorrect').set('text', _testInfo.correct + '/' + _testInfo.partial);

    _createLblIncorrectWords();
    _createCllIncorrect();
  }


  // UI ----------------------------------------------------------------------------------------------------------------


  var _page = tabris.create('Page', {
    title: 'Speed Test',
    topLevel: true
  }).on('appear', function() {
    _createUI();
    ptgLib.startSpeedTest();
    _nextWord();
    _timer = 0;
    _intervalId = window.setInterval(_incrementTimer, 1000);
  }).on('disappear', function() {
    if (_intervalId) {
      window.clearInterval(_intervalId);
    }
  });

  // _createUI();

  return _page;
};