define(['underscore', 'lib/infowar', 'lib/helpers'], function(_, Infowar, h) {
  var Position = h.Position;

  var metadata = {
    name: "Infowar",
    slug: "infowar",
    roles: [
      { slug: 'insurgents', name: 'Insurgents' },
      { slug: 'state', name: 'The State' }
    ]
  }

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

    var addPlayer = function(_socket, user, role) {
      if (!user) {
        throw "Invalid user";
      }

      if (!role || (role !== metadata.roles[0].slug && role !== metadata.roles[1].slug)) {
        throw "Invalid role: " + role;
      }

      socket = _socket;
      sendUpdate();
      var logAndHandle = function(message, callback) {
        socket.on(message, function(data) {
          console.log("["+user.gaming_id+"]: ", data);
          try {
            return callback(data);
          } catch (e) {
            socket.emit('error', e);
            console.log("Error: ", e);
          }
        });
      };
      logAndHandle('placeInsurgent', function(poskey) {
        infowar.addInsurgent(Position(poskey));
        sendUpdate();
      });
      logAndHandle('insurgentMove', function(move) {
        infowar.insurgentMove(Position(move.src), Position(move.dest));
        sendUpdate();
      });
      logAndHandle('stateMove', function(move) {
        infowar.stateMove(Position(move.src), Position(move.dest));
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

  Bridge.metadata = metadata;
  return Bridge;
});
