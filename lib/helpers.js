var lib = function(key, export_as) {
  return {
    key: key,
    export_as: export_as
  };
};

var libs = [
  lib('lib/constants', 'C'),
  lib('lib/position', 'Position'),
  lib('lib/board', 'Board'),
  lib('lib/pieces', 'Pieces'),
  lib('lib/kill', 'Kill'),
  lib('lib/grow', 'Grow'),
  lib('lib/interrogate', 'Interrogate'),
  lib('lib/state_move', 'StateMove'),
  lib('lib/state_turn', 'StateTurn'),
  lib('lib/insurgent_turn', 'InsurgentTurn'),
  lib('lib/insurgent_move', 'InsurgentMove'),
  lib('lib/history', 'History')
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
