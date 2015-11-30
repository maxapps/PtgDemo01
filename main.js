var ptgLib = require('./js/PtgLib');
var wordData = require('./js/data.json');

ptgLib.init(wordData);

require('./pages/main').create().open();
// require('./pages/settings').create();
require('./pages/eng2ptg').create();
require('./pages/ptg2eng').create();
require('./pages/speedtest').create();