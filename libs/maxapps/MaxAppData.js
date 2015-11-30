/***********************************************************************************************************************
MaxAppData.js
A module which provides simplistic persistent storage of application data.

CLASSES:

PROPERTY METHODS:
  appKey([sVal])

METHODS:
  clearValues()
  forceType(vVal, sType)
  forceTypes(vData, oFlds[, bClone])
  getArray(sKey[, aDef])
  getBoolean(sKey[, bDef])
  getDate(sKey[, dDef])
  getNumber(sKey[, nDef])
  getObject(sKey[, oDef[, oForce]])
  getString(sKey[, sDef])
  getValue(sKey[, vDef])
  hasKey(sKey)
  isType(vVal, sType)
  pushValue(sKey, vVal[, bUnique[, iLimit]])
  removeValue(sKey)
  setValue(sKey, vVal)

HISTORY:
  11-27-2015: Initial version for use with Tabris.js (NPM).
***********************************************************************************************************************/


// PRIVATE -------------------------------------------------------------------------------------------------------------

var _appKey = 'AppData';
var _keys = null;
var _public = {};

var _defaultForceTypeBooleanStrings = ['true', 'yes', 't', 'y'];

// PUBLIC --------------------------------------------------------------------------------------------------------------

// appKey([sVal])
// Gets or sets the string prepended to all values saved in localStorage for AppData.
//    sVal  - [null] If provided, this value is used as the new value.
// Returns the current (or previous) value.
_public.appKey = function() {
  var sRet = _appKey;
  if (arguments.length > 0) {
    _appKey = arguments[0];
  }

  return sRet;
};


// clearValues()
// Clears all AppData values from local storage. Note that this does not affect anything in local storage which was 
// not added via MaxAppData methods.
_public.clearValues = function() {
  _keys = _keys || _public.getObject('__allKeys', {});

  for (var s in _keys) {
    if (_keys.hasOwnProperty(s)) {
      localStorage.removeItem(_appKey + '.' + s);
    }
  }

  localStorage.removeItem(_appKey + '.' + '__allKeys');
  _keys = {};
};


// forceType(vVal, sType)
// Force the value provided to a specific type.
//    vVal  - Value to force.
//    sType - Type to return as a full name ('boolean|date|integer|number|string') or symbol ('!|@|#|%|$').
// Returns the value provided converted to the type specified.
// @example:
//  var appData = require('./libs/maxapps/MaxAppsData');
//  bVal = appData.forceType('Yes', '!');       // bVal == true
//  iVal = appData.forceType(true, 'integer');  // iVal == 1
_public.forceType = function(vVal, sType) {
  switch (sType) {
    case '!':
    case 'boolean':
      if (typeof vVal === 'string') {
        vVal = (_defaultForceTypeBooleanStrings.indexOf(vVal.toLowerCase()) >= 0);
      } else {
        vVal = !!vVal;
      }
      break;
    case '@':
    case 'date':
      if (vVal !== null) vVal = new Date(vVal);
      break;
    case '#':
    case 'integer':
      vVal = typeof vVal === 'number' ? vVal.floor() : (typeof vVal === 'boolean' ? (vVal ? 1 : 0) : parseInt(vVal));
      break;
    case '%':
    case 'number':
      if (typeof vVal !== 'number') {
        vVal = parseFloat(vVal);
      }
      break;
    case '$':
    case 'string':
      if (_public.isType(vVal, '@')) {
        vVal = vVal.toISOString();
      } else {
        vVal = typeof vVal === 'string' ? vVal : vVal.toString();
      }
      break;
    default:
      throw new Error('MaxAppData: Invalid type to force');
  }

  return vVal;
};


// forceTypes(vData, oFlds[, bClone])
// Force fields of an object to specific types. The is handy for converting JSON data from a server into objects with 
// specific types of properties (i.e. strings like '3.12159' into numbers and integers such as 0 and 1 into boolean 
// true or false).
//    vData   - Source object or array of objects with properties to force.
//    oFlds   - Object which describes which properties to force. Each property on oFlds forces the same property on 
//              the source object (or objects) to the specified type ('string', 'number', etc). Shortcuts are 
//              available for each type. See the forceType() method for more info.
//              If the data property being processed is an object, the field representing the property can be an 
//              object with properties defining how to force values on it.
//    bClone  - [false] If true, a new object is created instead of modifying the source object. In this case, the 
//              returned object will only have the properties specified in the oFlds parameter.
// Returns the object with modified properties.
// @example
//  var appData = require('./libs/maxapps/MaxAppsData');
//  var oData = {pi:'3.14159', jan1:'2000-01-01', answer:'42', yes:1, no:0};
//  oData = appData.forceTypes(oData, {pi:'%', jan1:'@', answer:'#', yes:'!', no:'boolean'});
//  // results in {pi:3.14159, jan1:~DATE~, answer:42, yes:True, no:False}
_public.forceTypes = function(vData, oFlds, bClone) {
  var aData, vRet;

  if (_public.isType(vData, '[')) {
    aData = bClone ? vData.clone() : vData;
    aData.forEach(function(oData) {
      _public.forceTypes(oData, oFlds, bClone);
    });
    vRet = aData;
  } else {
    vRet = bClone ? {} : vData;
    for (var s in oFlds) {
      if (_public.isType(oFlds[s], '{')) {
        _public.forceTypes(vData[s], oFlds[s], bClone);
      } else {
        vRet[s] = _public.forceType(vData[s], oFlds[s]);
      }
    }
  }

  return vRet;
};


// getArray(sKey[, aDef])
// Gets an array from local storage. If item doesn't exist or is not an array, the default is returned instead.
//    sKey  - The name of the key to retrieve.
//    aDef  - [null] The default to return if the key doesn't exist or is the wrong type.
// Returns the array stored in the specified key or the default value if the key doesn't contain an array.
_public.getArray = function(sKey, aDef) {
  var aRet = _public.getValue(sKey);
  return _public.isType(aRet, '[') ? aRet : aDef;
};


// getBoolean(sKey[, bDef])
// Gets a boolean value from local storage. If item doesn't exist or is not a boolean value, the default is 
// returned instead.
//    sKey  - The name of the key to retrieve.
//    bDef  - [false] The default to return if the key doesn't exist or is the wrong type.
// Returns the boolean value stored in the specified key or the default value if the key doesn't contain a boolean.
_public.getBoolean = function(sKey, bDef) {
  var bRet = _public.getValue(sKey);
  return _public.isType(bRet, '!') ? bRet : bDef;
};


// getDate(sKey[, dDef])
// Gets a date value from local storage. If item doesn't exist or is not a date value, the default is 
// returned instead.
//    sKey  - The name of the key to retrieve.
//    dDef  - [null] The default to return if the key doesn't exist or is the wrong type.
// Returns the date value stored in the specified key or the default value if the key doesn't contain a date.
_public.getDate = function(sKey, dDef) {
  var dRet = _public.getValue(sKey);
  return _public.isType(dRet, '@') ? dRet : dDef;
};


// getNumber(sKey[, nDef])
// Gets a number from local storage. If item doesn't exist or is not a number, the default is returned instead.
//    sKey  - The name of the key to retrieve.
//    nDef  - [-1] The default to return if the key doesn't exist or is the wrong type.
// Returns the number stored in the specified key or the default value if the key doesn't contain a number.
_public.getNumber = function(sKey, nDef) {
  var nRet = _public.getValue(sKey);
  return _public.isType(nRet, '#') ? nRet : nDef;
};


// getObject(sKey[, oDef[, oForce]])
// Gets an object from local storage. If item doesn't exist or is not an object, the default is returned instead.
//    sKey  - The name of the key to retrieve.
//    oDef  - [null] The default to return if the key doesn't exist or is the wrong type.
//    oForce  - [null] An object which can be used to force properties of the object retrieved to contain specific 
//              types of values. Dates for instance, are stored as an ISO string. In order to have them returned as 
//              an instance of date, you would need to force the value. See the forceValues() method for more info.
// Returns the object stored in the specified key or the default value if the key doesn't contain an object.
_public.getObject = function(sKey, oDef, oForce) {
  var oRet = _public.getValue(sKey);

  if (oRet && _public.isType(oRet, '{')) {
    if (oForce) {
      _public.forceTypes(oRet, oForce);
    }
  } else {
    oRet = oDef;
  }

  return oRet;
};


// getString(sKey[, sDef])
// Gets a string value from local storage. If item doesn't exist or is not a string value, the default is 
// returned instead.
//    sKey  - The name of the key to retrieve.
//    sDef  - [''] The default to return if the key doesn't exist or is the wrong type.
// Returns the string value stored in the specified key or the default value if the key doesn't contain a string.
_public.getString = function(sKey, sDef) {
  var sRet = _public.getValue(sKey);
  return _public.isType(sRet, '$') ? sRet : sDef;
};


// getValue(sKey[, vDef])
// Gets an untyped value from local storage. If item doesn't exist, the default is returned instead.
//    sKey  - The name of the key to retrieve.
//    vDef  - [null] The default to return if the key doesn't exist.
// Returns the value stored in the specified key or the default value if the key doesn't exist.
_public.getValue = function(sKey, vDef) {
  var vRet = localStorage.getItem(_appKey + '.' + sKey);
  return (typeof vRet != 'undefined') ? JSON.parse(vRet) : vDef;
};


// hasKey(sKey)
// Checks if the specified key exists.
//    sKey  - The name of the key to check.
// Returns true if the key has been defined.
_public.hasKey = function(sKey) {
  var vRet = localStorage.getItem(_appKey + '.' + sKey);
  return (typeof vRet != 'undefined');
};


// isType(vVal, sType)
// Checks if a value is the specified type.
//    vVal  - Value to check.
//    sType - String specifying type of value to check for as a single character or full name (array:[, boolean:!, 
//            date:@, number:#, object:{, string:{).
// Returns true if the value is an instance of the specified type.
_public.isType = function(vVal, sType) {
  var bRet = false;

  switch(sType.toLowerCase()) {
    case '[':
    case 'array':   bRet = Array.isArray(vVal); break;
    case '!':
    case 'boolean': bRet = typeof vVal === 'boolean'; break;
    case '@':
    case 'date':    bRet = vVal instanceof Date && !isNaN(vVal.valueOf()); break;
    case '#':
    case 'number':  bRet = typeof vVal === 'number'; break;
    case '{':
    case 'object':  bRet = (!!vVal) && (vVal.constructor === Object); break;
    case '$':
    case 'string':  bRet = typeof vVal === 'string'; break;
  }

  return bRet;
};


// pushValue(sKey, vVal[, bUnique[, iLimit]])
// Adds a value to the specified key (which must be an array).
//    sKey    - Name of the key which contains the array. If not an array, an error is thrown.
//    vVal    - Value which will be added to the array.
//    bUnique - [false] If true, the value is only added if it does not already exist.
//    iLimit  - [null] The maximum number of elements to allow in the array. If pushing the new value will exceed 
//              this value, elements are removed from the beginning of the array as needed.
_public.pushValue = function(sKey, vVal, bUnique, iLimit) {
  var iLen;
  var aVals = _public.getArray(sKey, []);

  if (aVals) {
    if (!bUnique || aVals.indexOf(vVal) < 0) {
      aVals.push(vVal);
    }

    iLen = aVals.length;
    if (iLimit && (iLen > iLimit)) {
      aVals = aVals.slice(iLen - iLimit);
    }

    _public.setValue(sKey, aVals);
  } else {
    throw new Error('MaxAppData: named value is not an array');
  }
};


// removeValue(sKey)
// Removes the specified key from local storage.
//    sKey  - Name of the key to remove.
_public.removeValue = function(sKey) {
  localStorage.removeItem(_appKey + '.' + sKey);

  if (_keys) {
    delete _keys[sKey];
    _public.setValue('__allKeys', _keys);
  }
};


// setValue(sKey, vVal)
// Sets a value for the specified key.
//    sKey  - Name of key to set.
//    vVal  - Value to associate with the key.
_public.setValue = function(sKey, vVal) {
  localStorage.setItem(_appKey + '.' + sKey, JSON.stringify(vVal));

  if (sKey != '__allKeys') {
    _keys = _keys || _public.getObject('__allKeys', {});
    _keys[sKey] = true;
    _public.setValue('__allKeys', _keys);
  }
};


module.exports = _public;