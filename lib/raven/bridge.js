define(['underscore', 'lib/infowar', 'lib/helpers'], function(_, Infowar, h) {
  var Position = h.Position;
  var History = h.History;

  var metadata = {
    name: "Infowar",
    slug: "infowar",
    roles: [
      { slug: h.C.INSURGENT, name: 'Insurgents' },
      { slug: h.C.STATE, name: 'The State' }
    ]
  }

  var Bridge = function(raven, historyDTO) {
    var infowar;
    if (historyDTO) {
      var history = _.map(historyDTO, function(dto) {
        return History.fromDTO(dto);
      });
      infowar = Infowar(history);
    } else {
      infowar = Infowar();
    }
    var socket;

    var asDTO = function() {
      return _.map(infowar.history(), function(entry) {
        return entry.toDTO();
      });
    };

    var save = function() {
      raven.save(asDTO());
    };

    var sendUpdate = function() {
      var history = asDTO();
      raven.broadcast('update', { history: history });
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
          console.log("["+user.gaming_id+"] " + message + ": ", data);

          try {
            if (restrictedRole) {
              if ((typeof restrictedRole == "string" && role !== restrictedRole) ||
                (typeof restrictedRole == "function" && role !== restrictedRole())) {
                throw "It's not your turn!";
              }
            }
            return callback(data);
          } catch (e) {
            socket.emit('error', e);
            console.log("Error: ", e);
            console.log(e.stack);
          }
        });
      };
      logAndHandle('placeInsurgent', h.C.INSURGENT, function(poskey) {
        infowar.addInsurgent(Position(poskey));
        save();
        sendUpdate();
      });
      logAndHandle('insurgentMove', h.C.INSURGENT, function(move) {
        infowar.insurgentMove(Position(move.src), Position(move.dest));
        save();
        sendUpdate();
      });
      logAndHandle('stateMove', h.C.STATE, function(move) {
        infowar.stateMove(Position(move.src), Position(move.dest));
        save();
        sendUpdate();
      });
      logAndHandle('grow', h.C.INSURGENT, function(poskey) {
        infowar.grow(Position(poskey));
        save();
        sendUpdate();
      });
      logAndHandle('kill', h.C.STATE, function(poskey) {
        infowar.kill(Position(poskey));
        save();
        sendUpdate();
      });
      logAndHandle('interrogate', h.C.STATE, function(poskey) {
        var results = infowar.interrogate(Position(poskey));
        socket.emit('interrogate-result', _.map(results, function(position) { return position.asKey(); }));
        save();
        sendUpdate();
      });
      logAndHandle('endTurn', function() { return infowar.currentTurn().id(); }, function() {
        infowar.endTurn();
        save();
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
      addPlayer: addPlayer,
      getPlayerCount: getPlayerCount
    };
  };

  Bridge.metadata = metadata;
  return Bridge;
});
