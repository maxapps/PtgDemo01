var appData = require('../libs/maxapps/MaxAppData');

// PRIVATE -------------------------------------------------------------------------------------------------------------

var _STATUS_LEARN  = 1;
var _STATUS_HARD   = 6;
var _STATUS_GOOD   = 8;
var _STATUS_EASY   = 12;

var _MINUS_POINTS_INC  = 10;
var _POINTS_PER_CORRECT = 10;
var _POINTS_PER_PARTIAL = 4;
// var _POINTS_PER_SECOND  = 2;
// var _SECONDS_PER_ANSWER = 10;

var _appOptions;
var _current;
var _mode = 'e2p';
var _public = {};
var _selectedGroups;
var _speedTest;
var _wordGroups;
var _wordList;
var _wordMap;
var _wordStats;

var _replacements = {'á':'a', 'ã':'a', 'ç':'c', 'é':'e', 'ê':'e', 'í':'i'};


// _allOtherWordsLearned()
function _allOtherWordsLearned() {
  var iCnt = 0;
  var sChr = _mode.charAt(0);

  for (var s in _wordStats) {
    if (_wordStats[s].s[sChr] == _STATUS_LEARN) {
      if (++iCnt > 1) return false;
    }
  }

  return true;
}


// _arraysEqual(aSrc1, aSrc2)
// From: http://stackoverflow.com/questions/22395357/how-to-compare-two-arrays-are-equal-using-javascript-or-jquery
function _arraysEqual(aSrc1, aSrc2) {
  return (aSrc1.length == aSrc2.length) && aSrc1.every(function(vItem, iNdx) {
    return vItem === aSrc2[iNdx]; 
  });
}


// _compareSoundex(s1, s2)
function _compareSoundex(s1, s2) {
  return _soundex(s1) == _soundex(s2) ? -1 : 0;
}


// _loadAudio()
function _loadAudio() {
  var sPath = tabris.app.getResourceLocation('./resources/audio/aboard.mp3');
  console.warn(sPath);

  window.plugins.NativeAudio.preloadSimple('aboard', sPath, function(msg) {
    console.log('Audio loaded!');
  }, function(msg) {
    console.warn('error: ' + msg);
  });
}


// _randomInt(iMin, iMax)
function _randomInt(iMin, iMax) {
  return Math.floor(Math.random() * (iMax - iMin + 1)) + iMin;
}


// _sortWords()
// If priorities of compared stats are the same, randomly return which should be considered first.
function _sortWords() {
  var sPri = _mode.charAt(0);

  _wordList.sort(function(sEng1, sEng2) {
    var iPri1 = _wordStats[sEng1][sPri];
    var iPri2 = _wordStats[sEng2][sPri];
    var iRnd = _randomInt(-1, 1);

    return iPri1 == iPri2 ? iRnd : iPri1 - iPri2;
  });
}


// _soundex(sSrc)
// From PHPJS.org at http://phpjs.org/functions/soundex/
function _soundex(sSrc) {
  var iNdx1, iNdx2, iP1, iS1, sChr, sRet, oMap, aSdx;

  sSrc = (sSrc + '').toUpperCase();
  if (sSrc) {
    aSdx = [0, 0, 0, 0];
    oMap = {B:1, F:1, P:1, V:1, C:2, G:2, J:2, K:2, Q:2, S:2, X:2, Z:2, D:3, T:3, L:4, M:5, N:5, R:6};
    iNdx1 = 0;
    iS1 = 0;

    while ((sChr = sSrc.charAt(iNdx1++)) && iS1 < 4) {
      if (iNdx2 = oMap[sChr]) {
        if (iNdx2 !== iP1) {
          aSdx[iS1++] = iP1 = iNdx2;
        }
      } else {
        iS1 += iNdx1 === 1;
        iP1 = 0;
      }
    }

    aSdx[0] = sSrc.charAt(0);
    sRet =  aSdx.join('');
  } else {
    sRet = '';
  }

  return sRet;
}


// _statusToString(iStatus)
function _statusToString(iStatus) {
  switch (iStatus) {
    case _STATUS_HARD:  return 'hard';
    case _STATUS_GOOD:  return 'good';
    case _STATUS_EASY:  return 'easy';
    default:            return 'again';
  }
}


// PUBLIC --------------------------------------------------------------------------------------------------------------

// answer()
// Gets the answer for the current word.
// Returns a string which is the answer for the current word.
_public.answer = function() {
  if (_mode == 'test') {

  } else {
    return _current.word[_mode.charAt(2)];
  }
};


// checkSpeedTestAnswer(sAnswer)
// Checks if the answer provided by the user during a speed test matches the correct answer after converting any 
// non-English characters.
//    sInput  - Raw input provided by the user.
// Returns 1 if answer was correct, 0 if incorrect, and (if soundex matching is enabled) -1 if soundex matches.
_public.checkSpeedTestAnswer = function(sInput) {
  var iRet, sChr, sTest;
  
  sInput = sInput.toLowerCase();
  sAnswer = _current.a.toLowerCase();
  iRet = sInput == sAnswer ? 1 : 0;

  if (!iRet) {
    sTest = '';
    for (var i = 0, l = sAnswer.length; i < l; ++i) {
      sChr = sAnswer.charAt(i);
      sTest += sChr <= 'z' ? sChr : _replacements[sChr];
    }
    iRet = sInput == sTest ? 1 : (_appOptions.partCredit ? _compareSoundex(sInput, sAnswer) : 0);
  }

  if (iRet > 0) {
    _speedTest.correct += 1;
    _speedTest.score += _POINTS_PER_CORRECT;
  } else if (iRet < 0) {
    _speedTest.partial += 1;
    _speedTest.score += _POINTS_PER_PARTIAL;
  } else {
    _speedTest.incorrect += 1;
    _speedTest.incorrectWords.push(_current.t == 'e' ? {e:_current.q, p:_current.a} : {e:_current.a, p:_current.q});
    _speedTest.minusPoints += _MINUS_POINTS_INC;
    _speedTest.score -= _speedTest.minusPoints;
  }

  return iRet;
};


// currentWord()
// Gets an object representing the current word.
// Returns an object which represents the current word {g:$, e:$, p:$, d:#}.
_public.currentWord = function() {
  return _current.word;
};


// currentStats()
// Gets an object representing the current word's statistics.
// Returns an object representing stats for the current word {c:#, e:#, p:#, s:#}.
_public.currentStats = function() {
  return _current.stats;
};


// groups(bSort)
// ...
_public.groups = function(bSort) {
  var aRet = [];

  for (var s in _wordGroups) {
    aRet.push({id:s, label:_wordGroups[s].label});
  }

  if (bSort) {
    aRet = aRet.sort(function(oGrp1, oGrp2) {
      return oGrp1.label < oGrp2.label
        ? -1
        : (oGrp1.label > oGrp2.label ? 1 : 0);
    });
  }

  return aRet;
};


// init(oData)
// Initialize the module.
//    oData - Object with data defining the words/phrases to learn:
//              version - String with version information for the data.
//              groups  - Object with properties representing the word groups:
//                          label - String to represent group in settings screen.
//                          words - An array of objects representing words/phrases in the group:
//                                    e - String with English word/phrase.
//                                    p - String with Portuguese word/phrase.
//                                    d - Integer with duration of audio for the word.
_public.init = function(oData) {
  if (window.plugins) {
    console.log('PLUGINS!');
    if (window.plugins.NativeAudio) {
      console.log('NativeAudio');
      _loadAudio();
    }
  }
// appData.clearValues();
  _appOptions = appData.getObject('AppOptions', 
      {playAudio:true, dupeWords:false, partCredit:false, selectedGroups:['group1']});
// _appOptions.selectedGroups = ['group1'];
  _wordGroups = oData.groups;
  _wordStats = appData.getObject('WordStats', {});  // {$eng:{c:#, e:#, p:#, s:#}, ...}
// _wordStats = {};
  if (_public.selectGroups(_appOptions.selectedGroups)) {
    appData.setValue('WordStats', _wordStats);
  }
};


// learned([bVal])
// Gets or sets the learned status of the current word in the current mode.
//    bVal  - [null]
_public.learned = function() {
  var bRet = (_current.stats.s[_mode.charAt(0)] > _STATUS_LEARN);

  if (arguments.length > 0) {
    _current.stats.s = arguments[0] === true ? _STATUS_GOOD : _STATUS_LEARN;
  }

  return bRet;
};


// mode([sMode])
// Gets or sets the mode ('e2p'|'p2e'|'test').
//    sMode - [null] If provided, sets the mode (English to Portuguese|Portuguese to English). Note that any value 
//            other than 'e2p', 'p2e', or 'test' will result in an error.
// Returns a string with the current or new value.
_public.mode = function(sMode) {
  var sRet = _mode;

  if (arguments.length > 0) {
    if (sMode == 'e2p' || sMode == 'p2e' || sMode == 'test') {
      _mode = sMode;
    } else {
      throw new Error('PtgLib: Invalid mode provided <' + sMode + '>');
    }
  }

  return sRet;
};


// nextWord()
// Advances pointer to the next word.
// If in 'test' mode, returns an object representing the speed test (words:[, count:#, total:#, score:#, correct:#, 
// incorrect:#, partial:#, minusPoints:#, question:$, answer:$, finished:!, incorrectWords:[]). If there are no 
// remaining test words or not in 'test' mode, null is returned.
_public.nextWord = function() {
  var oRet;

  if (_mode == 'e2p' || _mode == 'p2e') {
    _sortWords();
    _current = {word:_wordMap[_wordList[0]], stats:_wordStats[_wordList[0]]};
  } else {
    oRet = _speedTest;
    _current = _speedTest.words.shift();
    _speedTest.finished = (typeof _current === 'undefined');

    if (!_speedTest.finished) {
      _speedTest.count += 1;
      _speedTest.question = _current.q;
      _speedTest.answer = _current.a;
    }
  }

  return oRet;
};


// option(sName[, vVal[, bSave]])
// ...
// playAudio:!, dupeWords:!, partCredit:!, selectedGroups:[
_public.option = function(sName) {
  var bAll = (sName == '*');
  var vRet = bAll ? _appOptions : _appOptions[sName];

  if (vRet === null) {
    throw new Error('PtgLib: Invalid option name provided <' + sName + '>');
  }

  if (arguments.length > 1) {
    if (bAll) {
      _appOptions = arguments[1];
    } else {
      _appOptions[sName] = arguments[1];
    }

    if (bAll || (arguments.length > 2 && arguments[3] === true)) {
      appData.setValue('AppOptions', _appOptions);
    }
  }

  return vRet;
};


// playAudio()
// Plays the audio file for the current word.
_public.playAudio = function() {
  if (window.plugins && window.plugins.NativeAudio) {
    window.plugins.NativeAudio.play('aboard');
  } else {
    console.log('Audio: ' + _current.word.p);
  }
};


// question()
// Gets the question for the current word.
// Returns a string which is the question for the current word.
_public.question = function() {
  if (_mode == 'test') {
    return _current.q;
  } else {
    return _current.word[_mode.charAt(0)];
  }
};


// resetWordStats()
// Rest the statistics for all words in all groups.
// Returns the new statistics object (for persistent storage).
_public.resetWordStats = function() {
  _wordStats = {};

  for (var sGrp in _wordGroups) {
    _wordGroups[sGrp].words.forEach(function(oWord) {
      if (!_wordStats[oWord.e]) {
        _wordStats[oWord.e] = {c:0, e:0, p:0, s:{e:_STATUS_LEARN, p:_STATUS_LEARN}};
      }
    });
  };

  return _wordStats;
};


// selectGroups(aSelGrps)
// Selects which word groups are displayed for E2P, P2E, and SpeedTest.
//    aSelGrps  - An array of strings with the IDs of the groups to use.
// Returns true if new words were added to the statistics object (_wordStats).
_public.selectGroups = function(aSelGrps) {
  var bRet = false;

  if (!_selectedGroups || !_arraysEqual(aSelGrps, _selectedGroups)) {
    _wordMap = {};
    _wordList = [];
    _selectedGroups = aSelGrps;

    aSelGrps.forEach(function(sGrp) {
      _wordGroups[sGrp].words.forEach(function(oWord) {
        var sEng = oWord.e;

        oWord.g = sGrp;
        _wordMap[sEng] = oWord;
        _wordList.push(sEng);

        if (!_wordStats[sEng]) {
          bRet = true;
          _wordStats[sEng] = {c:0, e:0, p:0, s:{e:_STATUS_LEARN, p:_STATUS_LEARN}};
        }
      });
    });
  }

  return bRet;
};


// startSpeedTest()
// ...
_public.startSpeedTest = function() {
  var oTest;
  var aWords = [];

  for (var s in _wordGroups) {
    if (_selectedGroups.indexOf(s) >= 0) {
      _wordGroups[s].words.forEach(function(oWord) {
        if (_appOptions.dupeWords) {
          aWords.push({q:oWord.e, a:oWord.p, t:'e'});
          aWords.push({q:oWord.p, a:oWord.e, t:'p'});
        } else {
          aWords.push(Math.random() < 0.5 ? {q:oWord.e, a:oWord.p, t:'e'} : {q:oWord.p, a:oWord.e, t:'p'});
        }
      });
    }
  }

  _mode = 'test';
  _speedTest = {words:[], count:0, 
      total:aWords.length, score:0, correct:0, incorrect:0, partial:0, minusPoints:0, incorrectWords:[]};
  while (aWords.length) {
    _speedTest.words.push(aWords.splice(_randomInt(0, aWords.length - 1), 1)[0]);
  }
};


// status([sVal])
// Gets or sets the status of the current word for the current mode.
//    sVal - [null] If provided, string with new status for the word ('learned|again|easy|good|hard').
// Returns a string with the current or previous status of the word.
_public.status = function() {
  var sEng, sPri, sRet;
  var oStats = _public.currentStats();

  if (arguments.length > 0) {
    sRet = arguments[0];
    sPri = _mode.charAt(0);
    sEng = _wordList.shift();

    switch (sRet) {
      case 'learned':
        oStats.c = 0;
        oStats.s[sPri] = _STATUS_GOOD;
        oStats[sPri] = 10;
        break;
      case 'again':
        oStats.s[sPri] = _STATUS_LEARN;
        oStats[sPri] = 1;
        break;
      case 'easy':
        oStats.s[sPri] = _STATUS_EASY;
        break;
      case 'good':
        oStats.s[sPri] = _STATUS_GOOD;
        break;
      case 'hard':
        oStats.s[sPri] = _STATUS_HARD;
        break;
    }

    oStats.c += 1;
    oStats[sPri] = oStats.c * oStats.s[sPri];

    _wordList.push(sEng);
    if (oStats.s[sPri] != _STATUS_LEARN || !_allOtherWordsLearned()) {
      _sortWords();
    }

    appData.setValue('WordStats', _wordStats);
  } else {
    sRet = _statusToString(oStats.s);
  }

  return _wordStats;
};


module.exports = _public;