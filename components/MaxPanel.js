var maxTabris = require('../libs/maxapps/MaxTabris');

maxTabris.register('Panel', {
  
  // create(...)
  create: function(oProps) {
    var aChld = [];
    var oTmp = maxTabris.copyProps(oProps, ['id', 'layoutData']);
    var mCmp = tabris.create('Composite', oTmp);

    if (oProps.title) {
      oTmp = {layoutData:{top:0, left:0, right:0}, background:'#0000FF'};
      var mTitle = tabris.create('Composite', oTmp);
      aChld.push(mTitle);

      oTmp = {layoutData:{top:5, left:10, bottom:5}, font:'24px', text:'Title goes here'};
      tabris.create('TextView', oTmp).appendTo(mTitle);
    }

    if (oProps.content) {
      aChld = aChld.concat(oProps.content);
    }

    maxTabris.append(mCmp, aChld);

    return mCmp;
  }

});