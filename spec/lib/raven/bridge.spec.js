define(['underscore', 'lib/helpers', 'lib/asymmetric_warfare', 'lib/raven/bridge'], function(_, h, AsymmetricWarfare, Ravenbridge) {
var Position = h.Position;

describe("Ravenbridge", function() {
  var bridge;
  var raven;

  beforeEach(function() {
    raven = {
      broadcast: function() {},
      save: function() {},
      gameover: function() {}
    };
    bridge = Ravenbridge(raven);
  });

  describe("metadata", function() {
    var metadata;
    beforeEach(function() {
      metadata = Ravenbridge.metadata;
    });
    it("should be defined", function() {
      expect(metadata).toBeDefined();
    });
    it("should describe the properties", function() {
      expect(metadata.name).toBe("Asymmetric Warfare");
      expect(metadata.slug).toBe("asymmetric-warfare");
      expect(metadata.roles).toBeDefined();
      expect(metadata.roles.length).toBe(2);
      expect(metadata.roles[0].slug).toBe(h.C.INSURGENT);
      expect(metadata.roles[0].name).toBe('Insurgents');
      expect(metadata.roles[1].slug).toBe('state');
      expect(metadata.roles[1].name).toBe('The State');
    });
  });
  describe("connecting a player", function() {
    it("should send the game history", function() {
      var data;
      var socket = {
        emit: function(message, _data) {
          data = _data;
        },
        on: function() {
        }
      };
      var player = {};
      spyOn(socket, 'emit').andCallThrough();
      bridge.addPlayer(socket, player, Ravenbridge.metadata.roles[0].slug);
      expect(socket.emit).toHaveBeenCalledWith('update', jasmine.any(Object));
      var data = socket.emit.mostRecentCall.args[1];
      expect(data.history).toBeDefined();
      expect(data.history.length).toBe(5);
      for (var i = 0; i < 5; i++) {
        var entry = data.history[i];
        expect(entry.type).toBe(h.C.PLACEMENT);
        expect(entry.player).toBe(h.C.STATE);
        expect(entry.position).toBe(Position(h.C.CAPITAL)(0).asKey());
      }
    });
    describe("as state player", function() {
      var socket, data;
      // State can't see initial insurgent placements
      beforeEach(function() {
        asymwar = AsymmetricWarfare();
        _.times(5, function(i) {
          asymwar.addInsurgent(Position(0)(0));
        });
        bridge = Ravenbridge(raven, _.map(asymwar.history(), function(entry) { return entry.toDTO(); }));
        socket = { emit: function() {}, on: function() {} };
        spyOn(socket, 'emit');
        bridge.addPlayer(socket, {gaming_id: "state"}, h.C.STATE);
        expect(socket.emit).toHaveBeenCalled();
        expect(socket.emit.mostRecentCall.args[0]).toBe('update');
        data = socket.emit.mostRecentCall.args[1];
      });
      it("should not send a history that includes the positions of the placed insurgents", function() {
        var history = data.history;
        expect(history).toBeDefined();
        _.times(5, function(i) {
          var entry = history[i+5];
          expect(entry.type).toBe(h.C.PLACEMENT);
          expect(entry.player).toBe(h.C.INSURGENT);
          expect(entry.position).toBe(null);
        })
      });
      it("should send visible game-state", function() {
        var state = data.state;
        expect(state).toBeDefined();
        expect(state.currentTurn).toBe(h.C.INSURGENT);
        expect(state.currentPhase).toBe(h.C.PLAYING);
        expect(state.killedInsurgents).toBe(0);
        var insurgents = state.visibleInsurgents;
        expect(insurgents).toBeDefined();
        expect(insurgents.length).toBe(5);
        _.times(5, function(i) {
          expect(insurgents[i]).toBe(Position(0)(0).asKey());
        });
      });
    });
  });
  describe("receiving a message", function() {
    var message;
    var insurgentSocket, stateSocket;
    beforeEach(function() {
      var placeInsurgent;
      insurgentSocket = {
        emit: function() {},
        on: function(message, _handler) {
          if (message === 'insurgentMove') {
            handler = _handler;
          } else if (message === 'placeInsurgent') {
            placeInsurgent = _handler;
          }
        }
      };
      stateSocket = {
        emit: function() {},
        on: function() {}
      };
      bridge.addPlayer(insurgentSocket, {}, h.C.INSURGENT);
      bridge.addPlayer(stateSocket, {}, h.C.STATE);
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());

      spyOn(raven, 'broadcast');
      spyOn(insurgentSocket, 'emit');
      spyOn(stateSocket, 'emit');
      handler({ src:Position(0)(0).asKey(), dest:Position(1)(0).asKey()});
    });
    it("should send full game history to the state player", function() {
      expect(insurgentSocket.emit.calls.length).toBe(1);
      expect(insurgentSocket.emit.calls[0].args[0]).toBe('update');
      var history = insurgentSocket.emit.calls[0].args[1].history;
      expect(history).toBeDefined();
      expect(history.length).toBe(11);
      expect(history[10].type).toBe(h.C.MOVE);
      expect(history[10].player).toBe(h.C.INSURGENT);
      expect(history[10].src).toBe(Position(0)(0).asKey());

      expect(history[10].dest).toBe(Position(1)(0).asKey());
    });
    it("should not send full history to state player", function() {
      expect(stateSocket.emit.calls.length).toBe(1);
      expect(stateSocket.emit.calls[0].args[0]).toBe('update');
      var data = stateSocket.emit.calls[0].args[1];
      var history = data.history;
      console.log(history);
      _.each(history, function(entry) {
        if (entry.player === h.C.INSURGENT) {
          expect(entry.masked).toBe(true);
        }
      });
      expect(data.state).toBeDefined();
    });
  });

  describe("with multiple players connected", function() {
    var player1, player2, socket1, socket2;
    beforeEach(function() {
      player1 = {};
      player2 = {};
      socket1 = { emit: function() {}, on: function() {} };
      socket2 = { emit: function() {}, on: function() {} };
    });
    describe("receiving a message that has response data", function() {
      var interrogate;
      beforeEach(function() {
        //Bring asymwar to a state where we can issue a State Interrogation
        var asymwar = AsymmetricWarfare();
        _.times(5, function(n) { asymwar.addInsurgent(Position(0)(n)); });
        asymwar.insurgentMove(Position(0)(0), Position(1)(0));
        for (var i = h.C.CAPITAL; i > 1; i--) {
          asymwar.endTurn();
          asymwar.stateMove(Position(i)(0), Position(i-1)(0));
          asymwar.endTurn();
        }
        asymwar.endTurn();
        //State can issue Interrogation now

        bridge = Ravenbridge(raven, _.map(asymwar.history(), function(entry) { return entry.toDTO(); }));

        socket1 = {
          emit: function() {},
          on: function(message, _handler) {
            if (message === 'interrogate') { interrogate = _handler };
          }
        };
        bridge.addPlayer(socket1, {}, h.C.STATE);
        bridge.addPlayer(socket2, {}, h.C.INSURGENT);
        spyOn(socket1, 'emit');
        spyOn(socket2, 'emit');
        spyOn(raven, 'broadcast');

        interrogate(Position(1)(0).asKey());
      });
      it("should transmit the response data back", function() {
        expect(socket1.emit.calls.length).toBe(2);
        var message = socket1.emit.calls[0].args[0];
        expect(message).toBe('interrogate-result');

        var data = socket1.emit.calls[0].args[1];
        expect(data.length).toBe(4);
        expect(data[0]).toBe("0,1");
      });
      it("should not transmit over broadcast", function() {
        expect(raven.broadcast.calls.length).toBe(0);
      });
      it("should not transmit to the other player" ,function() {
        expect(socket2.emit.calls.length).toBe(1); //should only be called once
        expect(socket2.emit.calls[0].args[0]).toBe('update');
      });
    });
    describe("receiving a message that is not appropriate for the role", function() {
      var placeInsurgent;
      beforeEach(function() {
        socket1 = {
          emit: function() {},
          on: function(message, _handler) {
            if (message === 'placeInsurgent') { placeInsurgent = _handler; };
          }
        };
        bridge.addPlayer(socket1, {}, h.C.STATE); //state player
        bridge.addPlayer(socket2, {}, h.C.INSURGENT); //state player
        spyOn(socket1, 'emit');
        spyOn(socket2, 'emit');
      });
      it("should emit an error", function() {
        placeInsurgent(Position(0)(0).asKey());
        expect(socket1.emit.calls.length).toBe(1);
        expect(socket1.emit.calls[0].args[0]).toBe('error');
        expect(socket1.emit.calls[0].args[1]).toBe("It's not your turn!");
      });
      it("should not notify the other player", function() {
        expect(socket2.emit).not.toHaveBeenCalled();
      });
    });
    describe("receiving a bad message", function() {
      var handler;
      beforeEach(function() {
        socket1 = {
          emit: function() {},
          on: function(message, _handler) {
            if (message === 'placeInsurgent') {
              handler = _handler;
            }
          }
        };
        bridge.addPlayer(socket1, {}, h.C.INSURGENT);
        bridge.addPlayer(socket2, {}, h.C.STATE);
        handler(Position(0)(0).asKey());
        handler(Position(0)(0).asKey());
        handler(Position(0)(0).asKey());
        handler(Position(0)(0).asKey());
        handler(Position(0)(0).asKey());
        spyOn(socket1, 'emit');
        spyOn(socket2, 'emit');
      });
      it("should not crash the server", function() {
        expect(function() {
          handler(Position(0)(0).asKey());
        }).not.toThrow();
        expect(socket1.emit).toHaveBeenCalledWith('error', jasmine.any(String));
      });
      it("should not notify the other player", function() {
        expect(function() {
          handler(Position(0)(0).asKey());
        }).not.toThrow();
        expect(socket2.emit).not.toHaveBeenCalled();
      });
    });
  });
});

return {
  name: 'ravenbridge_spec'
};
});
