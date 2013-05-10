define(['underscore', 'lib/infowar'], function(_, Infowar) {

  var Bridge = function() {
    var dbgame;
    var infowar = Infowar();

    /**
     * Old interface
     */

    var init = function(factory, _dbgame, egs_notifier) {
      dbgame = _dbgame;
      return this;
    };

    var addPlayer = function(socket, user) {
      var history = _.map(infowar.history(), function(entry) {
        return entry.toJSON();
      });
      socket.emit('update', { history: history });
    };

    var getPlayerCount = function() {
      return 0;
    };

    var getDBGame = function() {
      return dbgame;
    };
    /*
     * end old interface
     */

    return {
      init: init,
      addPlayer: addPlayer,
      getPlayerCount: getPlayerCount,
      getDBGame: getDBGame
    };
  };

  var metadata = {
    name: "Infowar",
    slug: "infowar",
    roles: [
      { slug: 'insurgents', name: 'Insurgents' },
      { slug: 'state', name: 'The State' }
    ]
  }

  Bridge.metadata = metadata;
  return Bridge;
});
