define(['underscore', 'lib/infowar', 'lib/helpers'], function(_, Infowar, h) {
  var Position = h.Position;

  var Bridge = function() {
    var dbgame;
    var infowar = Infowar();
    var socket;

    /**
     * Old interface
     */

    var init = function(factory, _dbgame, egs_notifier) {
      dbgame = _dbgame;
      return this;
    };

    var sendUpdate = function() {
      var history = _.map(infowar.history(), function(entry) {
        return entry.toDTO();
      });
      socket.emit('update', { history: history });
    };

    var addPlayer = function(_socket, user) {
      socket = _socket;
      sendUpdate();
      socket.on('placeInsurgent', function(poskey) {
        console.log("Request for insurgent to be placed at: " + poskey);
        infowar.addInsurgent(Position(poskey));
        sendUpdate();
      });
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
