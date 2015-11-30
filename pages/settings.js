require('../components/MaxSwitch');

var ptgLib = require('../js/PtgLib');
var maxTabris = require('../libs/maxapps/MaxTabris');

exports.create = function() {

  var _page = tabris.create('Page', {
    title: 'Settings',
    topLevel: true
  });

  
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
    ptgLib.resetWordStats();
    window.plugins.toast.showShortBottom('Word statitistics reset!');
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