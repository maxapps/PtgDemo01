require('../components/MaxSwitch');

var ptgLib = require('../js/PtgLib');
var maxTabris = require('../libs/maxapps/MaxTabris');

exports.create = function() {

  // _resetStats(iBtn)
  function _resetStats(iBtn) {
    if (iBtn == 1) {
      ptgLib.resetWordStats();
      window.plugins.toast.showShortBottom('Word statitistics reset!');
    }
  }


  var _page = tabris.create('Page', {
    title: 'Portuguese Demo (Tabris)',
    topLevel: true
  });

  tabris.create('Drawer').append(tabris.create('PageSelector'));
  
  // Application Settings
  tabris.create('TextView', {
    id: 'lblApplication',
    layoutData: {left:10, top:12},
    font: 'bold 24px',
    text: 'Application'
  }).appendTo(_page);

  maxTabris.create('Switch', {
    id: 'swcAppAudio',
    layoutData: {left:12, top:['#lblApplication', 10]},
    font: '20px',
    text: 'Play audio with answer'
  }).appendTo(_page);

  tabris.create('Button', {
    id: 'btnAppReset',
    layoutData: {centerX:0, top:['#swcAppAudio', 14]},
    background: '#FFA0A0',
    text: 'Reset Word Stats'
  }).on('select', function() {
    navigator.notification.confirm(
        'Reset status (easy, hard, etc) for all words?', _resetStats, 'Confirm Reset', ['Reset', 'Cancel']);
  }).appendTo(_page);


  // Speed Test Settings
  tabris.create('TextView', {
    id: 'lblSpeedTest',
    layoutData: {left:10, top:['#btnAppReset', 30]},
    font: 'bold 24px',
    text: 'Speed Test'
  }).appendTo(_page);

  maxTabris.create('Switch', {
    id: 'swcSpeedDupe',
    layoutData: {left:12, top:['#lblSpeedTest', 10]},
    font: '20px',
    text: 'Duplicate words on speed test'
  }).appendTo(_page);

  maxTabris.create('Switch', {
    id: 'swcSpeedPartial',
    layoutData: {left:12, top:['#swcSpeedDupe', 10]},
    font: '20px',
    text: 'Partial credit for misspellings'
  }).appendTo(_page);


  // Word Groups Settings
  tabris.create('TextView', {
    id: 'lblGroups',
    layoutData: {left:10, top:['#swcSpeedPartial', 32]},
    font: 'bold 24px',
    text: 'Word Groups'
  }).appendTo(_page);

  var sPrev = '#lblGroups';
  ptgLib.groups(true).forEach(function(oGrp) {
    var sId = 'swc_' + oGrp.id;
    maxTabris.create('Switch', {
      id: sId,
      layoutData: {left:12, top:[sPrev, 10]},
      font: '20px',
      text: oGrp.label
    }).appendTo(_page);
    sPrev = '#' + sId;
  });
  

  _page.on('appear', function() {
    var oOpts = ptgLib.option('*');

    _page.find('#swcAppAudio')[0].selection(oOpts.playAudio);
    _page.find('#swcSpeedDupe')[0].selection(oOpts.dupeWords);
    _page.find('#swcSpeedPartial')[0].selection(oOpts.partCredit);

    oOpts.selectedGroups.forEach(function(sGrp) {
      _page.find('#swc_' + sGrp)[0].selection(true);
    });
  }).on('disappear', function() {
    var oOpts = {
      playAudio: _page.find('#swcAppAudio')[0].selection(),
      dupeWords: _page.find('#swcSpeedDupe')[0].selection(),
      partCredit: _page.find('#swcSpeedPartial')[0].selection(),
    };

    oOpts.selectedGroups = [];
    ptgLib.groups().forEach(function(oGrp) {
      if (_page.find('#swc_' + oGrp.id)[0].selection()) {
        oOpts.selectedGroups.push(oGrp.id);
      }
    });

    ptgLib.option('*', oOpts, true);
    ptgLib.selectGroups(oOpts.selectedGroups);
  });


  return _page;
};


/*
I have spent the last couple months searching for a viable way to create cross-platform apps from a single code base. During this process I have looked at numerous JS/HTML5 options including several cordova variants (including PhoneGap, Intel XDK, and Telerik AppBuilder) and JS/Native options such as NativeScript and Appcelerator.

I definitely learned a lot and discovered some really cool tools and several promising looking HTML5 platforms/frameworks but they all left me feeling unsatisfied. The HTML5 tools are getting better and I was able to create something which was "almost but not quite completely unlike" a native app using them. I have a paid subscription for Telerik AppBuilder and obviously had high hopes for it and for NativeScript.

AppBuilder is usable if you skip their IDE but the performance just isn't smooth enough and their mobile toolset is not complete. The closest I came to something acceptable using it was with skipping their components and using a combination of Vue.js and slightly modified Material Design Lite components.

I discovered Tabris while researching ways to use Material Design with NativeScript and was immediately intrigued. Reading through the documentation, I couldn't figure out how it could really be this good if nobody was talking about it. Four days later I have a complete working version of the same test app I've used on all the other platforms (a simple app for memorizing a selection of Portuguese words). Everything about Tabris just makes sense to me and the quick workflow allowed by the Developer App is what really makes it shine. I was planning to investigate React Native but have put it off for now because Tabris is just so impressive.

***********************************************************************************************************************

I have spent the last couple months searching for a viable way to create cross-platform apps from a single code base. During this process I have looked at numerous JS/HTML5 options including several cordova variants and other JS/Native platforms.

I definitely learned a lot and discovered several promising looking platforms/frameworks but they all left me feeling unsatisfied. The HTML5 tools are getting better and I was able to create something which was "almost but not quite completely unlike" a native app using them. I have a paid subscription for Telerik AppBuilder and obviously had high hopes for it and for NativeScript.

I discovered Tabris while researching ways to use Material Design with NativeScript and was immediately intrigued but highly doubtful (how good could it really be if nobody was talking about it?).

Four days later, I have a working version of the same multi-page test app created on all the other platforms . Everything about Tabris just makes sense to me and the quick workflow allowed by the Developer App is what really makes it shine. I was planning to investigate React Native but have put it off for now because Tabris is just so impressive.

***********************************************************************************************************************

Tabris.js is simply the best tool I've found for creating cross-platform mobile apps from a single code base and I've looked at pretty much everything available during the last couple months.

The only thing which might be close is React Native. It was next on my list but I got sidetracked by the discovery of Tabris while researching using Material Design with NativeScript. Someone posted a link to it in the comments section of a web page and, due to frustration with NS, I decided to take a look.

My initial reaction was that it was too good to be true and anything this promising would be far better known. Luckily for me, their web site makes it really easy to check everything out without installing anything on your computer. It only took about five minutes to be convinced they are for real.

Do yourself a favor and check into this incredible tool.
*/
