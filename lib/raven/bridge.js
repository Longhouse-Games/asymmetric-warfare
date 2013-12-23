define(['underscore', 'lib/asymmetric_warfare', 'lib/helpers'], function(_, AsymmetricWarfare, h) {
  var Position = h.Position;
  var History = h.History;

  var metadata = {
    name: "Asymmetric Warfare",
    slug: "asymmetric-warfare",
    roles: [
      { slug: h.C.INSURGENT, name: 'Insurgents' },
      { slug: h.C.STATE, name: 'The State' }
    ]
  }

  var Bridge = function(raven, historyDTO) {
    var asymwar;
    var sockets = {};
    sockets[h.C.INSURGENT] = null;
    sockets[h.C.STATE] = null;

    if (historyDTO) {
      var history = _.map(historyDTO, function(dto) {
        return History.fromDTO(dto);
      });
      asymwar = AsymmetricWarfare(history);
    } else {
      asymwar = AsymmetricWarfare();
    }

    asymwar.on('gameover', function(winning_role) {
      // No final scores are calculated
      var scores = {};
      scores[h.C.INSURGENT] = 0;
      scores[h.C.STATE] = 0;

      raven.gameover(winning_role, scores);
    });

    asymwar.on('end_of_turn', function(new_role) {
      var state = {};
      var other = asymwar.currentTurn().id() === h.C.STATE ? h.C.INSURGENT : h.C.STATE;
      state[new_role] = raven.ATTN;
      state[other] = raven.PEND;
      raven.setPlayerState(state);
    });

    var asDTO = function(role) {
      return _.map(asymwar.history(role), function(entry) {
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
        var history = asymwar.winner() ? asDTO() : asDTO(h.C.STATE); // Send full game history at end of game
        var data = {
          history: history
        };
        if (!asymwar.winner()) {
          data.state = asymwar.state(h.C.STATE);
        }
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
        var history = asymwar.winner() ? asDTO() : asDTO(role); // Send full game at gameover
        var data = {
          history: history
        };
        if (role === h.C.STATE && !asymwar.winner()) {
          data.state = asymwar.state(h.C.STATE);
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
        asymwar.addInsurgent(Position(poskey));
        save();
        broadcastUpdate();
      });
      logAndHandle('insurgentMove', h.C.INSURGENT, function(move) {
        asymwar.insurgentMove(Position(move.src), Position(move.dest));
        save();
        broadcastUpdate();
      });
      logAndHandle('stateMove', h.C.STATE, function(move) {
        asymwar.stateMove(Position(move.src), Position(move.dest));
        save();
        broadcastUpdate();
      });
      logAndHandle('grow', h.C.INSURGENT, function(poskey) {
        asymwar.grow(Position(poskey));
        save();
        broadcastUpdate();
      });
      logAndHandle('kill', h.C.STATE, function(poskey) {
        asymwar.kill(Position(poskey));
        save();
        broadcastUpdate();
      });
      logAndHandle('interrogate', h.C.STATE, function(poskey) {
        var results = asymwar.interrogate(Position(poskey));
        socket.emit('interrogate-result', _.map(results, function(position) { return position.asKey(); }));
        save();
        broadcastUpdate();
      });
      logAndHandle('endTurn', function() { return asymwar.currentTurn().id(); }, function() {
        asymwar.endTurn();
        save();
        broadcastUpdate();
      });
      socket.on('forfeit', function(data) {
        asymwar.forfeit(role);
        save();
        broadcastUpdate();
        raven.forfeit(role);
        raven.broadcast('message', {user: 'game', message: user.gaming_id + " has forfeited the game.", role: role});
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

  Bridge.initialPlayerState = function() {
    var state = {};
    state[h.C.INSURGENT] = "ATTN";
    state[h.C.STATE] = "PEND";
    return state;
  };
  Bridge.metadata = metadata;
  return Bridge;
});
