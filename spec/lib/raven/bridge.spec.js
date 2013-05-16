define(['lib/helpers', 'lib/infowar', 'lib/raven/bridge'], function(h, Infowar, Ravenbridge) {
var Position = h.Position;

describe("Ravenbridge", function() {
  var bridge;

  beforeEach(function() {
    bridge = Ravenbridge();
  });

  it("return an object", function() {
    expect(Ravenbridge).not.toBe(undefined);
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
      expect(metadata.name).toBe("Infowar");
      expect(metadata.slug).toBe("infowar");
      expect(metadata.roles).toBeDefined();
      expect(metadata.roles.length).toBe(2);
      expect(metadata.roles[0].slug).toBe('insurgents');
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
      expect(data.history).toBeDefined();
      expect(data.history.length).toBe(5);
      for (var i = 0; i < 5; i++) {
        var entry = data.history[i];
        expect(entry.type).toBe(h.C.PLACEMENT);
        expect(entry.player).toBe(h.C.STATE);
        expect(entry.position).toBe(Position(h.C.CAPITAL)(0).asKey());
      }
    });
  });
  describe("receiving a message", function() {
    var message;
    var socket;
    beforeEach(function() {
      var placeInsurgent;
      socket = {
        emit: function() {},
        on: function(message, _handler) {
          if (message === 'insurgentMove') {
            handler = _handler;
          } else if (message === 'placeInsurgent') {
            placeInsurgent = _handler;
          }
        }
      };
      spyOn(socket, 'emit');
      bridge.addPlayer(socket, {}, Ravenbridge.metadata.roles[0].slug);
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      placeInsurgent(Position(0)(0).asKey());
      handler({ src:Position(0)(0).asKey(), dest:Position(1)(0).asKey()});
    });
    it("should send game history", function() {
      expect(socket.emit.calls.length).toBe(7);
      expect(socket.emit.calls[6].args[0]).toBe('update');
      var history = socket.emit.calls[6].args[1].history;
      expect(history).toBeDefined();
      expect(history.length).toBe(11);
      expect(history[10].type).toBe(h.C.MOVE);
      expect(history[10].player).toBe(h.C.INSURGENT);
      expect(history[10].src).toBe(Position(0)(0).asKey());
      expect(history[10].dest).toBe(Position(1)(0).asKey());
    });
  });
  describe("receiving a bad message", function() {
    it("should not crash the server", function() {
      var handler;
      var socket = {
        emit: function() {},
        on: function(message, _handler) {
          if (message === 'placeInsurgent') {
            handler = _handler;
          }
        }
      };
      spyOn(socket, 'emit');
      bridge.addPlayer(socket, {}, Ravenbridge.metadata.roles[0].slug);
      handler(Position(0)(0).asKey());
      handler(Position(0)(0).asKey());
      handler(Position(0)(0).asKey());
      handler(Position(0)(0).asKey());
      handler(Position(0)(0).asKey());
      expect(function() {
        handler(Position(0)(0).asKey());
      }).not.toThrow();
      expect(socket.emit).toHaveBeenCalledWith('error', jasmine.any(String));
    });
  });
});

return {
  name: 'ravenbridge_spec'
};
});
