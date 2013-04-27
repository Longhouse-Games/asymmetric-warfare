var lib = function(key, export_as) {
  return {
    key: key,
    export_as: export_as
  };
};

var libs = [
  lib('lib/position', 'Position'),
  lib('lib/board', 'Board'),
  lib('lib/pieces', 'Pieces'),
  lib('lib/state_move', 'StateMove'),
  lib('lib/insurgent_move', 'InsurgentMove')
];

var keys = [],
    i;
for (i = 0; i < libs.length; i++) {
  keys.push(libs[i].key);
}

define(
  keys,
  function() {
    var exports = {};
    for (var i = 0; i < arguments.length; i++) {
      exports[libs[i].export_as] = arguments[i];
    }
    return exports;
  }
);
