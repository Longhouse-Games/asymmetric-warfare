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
    var sockets = {};
    sockets[h.C.INSURGENT] = null;
    sockets[h.C.STATE] = null;

    if (historyDTO) {
      var history = _.map(historyDTO, function(dto) {
        return History.fromDTO(dto);
      });
      infowar = Infowar(history);
    } else {
      infowar = Infowar();
    }

    var asDTO = function(role) {
      return _.map(infowar.history(role), function(entry) {
        return entry.toDTO();
      });
    };

    var save = function() {
      raven.save(asDTO());
    };

    var broadcastUpdate = function() {
      if (sockets[h.C.INSURGENT]) {
        var history = asDTO();
        sockets[h.C.INSURGENT].emit('update', { history: history });
      }

      if (sockets[h.C.STATE]) {
        var history = infowar.winner() ? asDTO() : asDTO(h.C.STATE); // Send full game history at end of game
        var data = {
          history: history
        };
        data.state = infowar.state(h.C.STATE);
        sockets[h.C.STATE].emit('update', data);
      }
    };

    /**
     * Old interface
     */

    var addPlayer = function(socket, user, role) {
      if (!user) {
        throw "Invalid user";
      }

      if (!role || (role !== h.C.STATE && role !== h.C.INSURGENT)) {
        throw "Invalid role: " + role;
      }

      sockets[role] = socket;

      var sendUpdate = function() {
        var history = infowar.winner() ? asDTO() : asDTO(role); // Send full game at gameover
        var data = {
          history: history
        };
        if (role === h.C.STATE && !infowar.winner()) {
          data.state = infowar.state(h.C.STATE);
        }
        socket.emit('update', data);
      };

      sendUpdate(socket);
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
        broadcastUpdate();
      });
      logAndHandle('insurgentMove', h.C.INSURGENT, function(move) {
        infowar.insurgentMove(Position(move.src), Position(move.dest));
        save();
        broadcastUpdate();
      });
      logAndHandle('stateMove', h.C.STATE, function(move) {
        infowar.stateMove(Position(move.src), Position(move.dest));
        save();
        broadcastUpdate();
      });
      logAndHandle('grow', h.C.INSURGENT, function(poskey) {
        infowar.grow(Position(poskey));
        save();
        broadcastUpdate();
      });
      logAndHandle('kill', h.C.STATE, function(poskey) {
        infowar.kill(Position(poskey));
        save();
        broadcastUpdate();
      });
      logAndHandle('interrogate', h.C.STATE, function(poskey) {
        var results = infowar.interrogate(Position(poskey));
        socket.emit('interrogate-result', _.map(results, function(position) { return position.asKey(); }));
        save();
        broadcastUpdate();
      });
      logAndHandle('endTurn', function() { return infowar.currentTurn().id(); }, function() {
        infowar.endTurn();
        save();
        broadcastUpdate();
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
