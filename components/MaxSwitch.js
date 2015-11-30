var maxTabris = require('../libs/maxapps/MaxTabris');

var _labelDefaults = {
  font: 'initial',
  label: 'label goes here',
  offsetX: 10
};

maxTabris.register('Switch', {
  
  // create(...)
  create: function(oProps) {
    var iOffX;
    var oDef = maxTabris.copyProps(oProps, ['id', 'layoutData']);
    var mComp = tabris.create('Composite', oDef);

    mComp.selection = function() {
      var bRet = mSwc.get('selection');
      if (arguments.length > 0) {
        mSwc.set('selection', arguments[0]);
      }
      return bRet;
    };

    var mSwc = tabris.create('Switch', {
      layoutData: {left:0, top:0}
    }).appendTo(mComp);

    iOffX = oProps.hasOwnProperty('offsetX') ? oProps.offsetX : _labelDefaults.offsetX;
    oDef = maxTabris.copyProps([_labelDefaults, oProps], ['font', 'text']);
    oDef.layoutData = {left:[mSwc, iOffX], baseline:mSwc};
    tabris.create('TextView', oDef).on('tap', function() {
      mSwc.set('selection', !mSwc.get('selection'));
    }).appendTo(mComp);

    return mComp;
  }

});