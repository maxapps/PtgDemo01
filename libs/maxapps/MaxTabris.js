/***********************************************************************************************************************
MaxTabris.js
A module which provides additional functionality for Tabris.js.

CLASSES:

PROPERTY METHODS:

METHODS:

HISTORY:
  11-28-2015: Initial version for use with Tabris.js (NPM).
***********************************************************************************************************************/


// PRIVATE -------------------------------------------------------------------------------------------------------------

var _public = {};
var _registered = {};

// PUBLIC --------------------------------------------------------------------------------------------------------------

// append(mParent, aAppend)
// ...
_public.append = function(mParent, aAppend) {
  if (aAppend.length > 0) {
    mParent.append.apply(mParent, aAppend);
  }
};


// copyProps(aObjects, aProps)
// ...
_public.copyProps = function(aObjects, aProps) {
  var oRet = {};

  aObjects = [].concat(aObjects);

  aObjects.forEach(function(oProps) {
    aProps.forEach(function(sProp) {
      if (oProps.hasOwnProperty(sProp)) {
        oRet[sProp] = oProps[sProp];
      }
    });
  });

  return oRet;
};


// create(sType[, oProps])
// ...
_public.create = function(sType, oProps) {
  var mType = _registered[sType];

  if (mType) {
    return mType.create(oProps);
  } else {
    throw new Error('MaxTabris: Attempt to create unregistered type <' + sType + '>');
  }
};


// register(sType, oDef)
// ...
_public.register = function(sType, oDef) {
  _registered[sType] = oDef;
};


module.exports = _public;