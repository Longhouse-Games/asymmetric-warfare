define(['underscore', 'lib/infowar', 'lib/helpers'], function(_, Infowar, h) {
  var Position = h.Position;

  var metadata = {
    name: "Infowar",
    slug: "infowar",
    roles: [
      { slug: h.C.INSURGENT, name: 'Insurgents' },
      { slug: h.C.STATE, name: 'The State' }
    ]
  }

  var Bridge = function() {
    var infowar = Infowar();
    var socket;

    var sendUpdate = function() {
      var history = _.map(infowar.history(), function(entry) {
        return entry.toDTO();
      });
      socket.emit('update', { history: history });
    };

    /**
     * Old interface
     */

    var addPlayer = function(_socket, user, role) {
      if (!user) {
        throw "Invalid user";
      }

      if (!role || (role !== h.C.STATE && role !== h.C.INSURGENT)) {
        throw "Invalid role: " + role;
      }

      socket = _socket;
      sendUpdate();
      var logAndHandle = function(message, restrictedRole, callback) {
        socket.on(message, function(data) {
          console.log("["+user.gaming_id+"]: ", data);

          try {
            if (role !== restrictedRole) {
              throw "It's not your turn!";
            }
            return callback(data);
          } catch (e) {
            socket.emit('error', e);
            console.log("Error: ", e);
          }
        });
      };
      logAndHandle('placeInsurgent', h.C.INSURGENT, function(poskey) {
        infowar.addInsurgent(Position(poskey));
        sendUpdate();
      });
      logAndHandle('insurgentMove', h.C.INSURGENT, function(move) {
        infowar.insurgentMove(Position(move.src), Position(move.dest));
        sendUpdate();
      });
      logAndHandle('stateMove', h.C.STATE, function(move) {
        infowar.stateMove(Position(move.src), Position(move.dest));
        sendUpdate();
      });
    };

    var getPlayerCount = function() {
      return 0;
    };

    /*
     * end old interface
     */

    return {
      init: init,
      addPlayer: addPlayer,
      getPlayerCount: getPlayerCount
    };
  };

  Bridge.metadata = metadata;
  return Bridge;
});
