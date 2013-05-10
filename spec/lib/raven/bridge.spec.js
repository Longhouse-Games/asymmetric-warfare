define(['lib/helpers', 'lib/infowar', 'lib/raven/bridge'], function(h, Infowar, Ravenbridge) {
var Position = h.Position;

describe("Ravenbridge", function() {
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
  describe("creation", function() {
    it("should be able to create infowar games", function() {
      var game = Ravenbridge().create();
      expect(game).toBeDefined();
      expect(game.initialInsurgents()).toBe(Infowar.INITIAL_INSURGENTS);
    });
  });
  describe("connecting a player", function() {
    it("should send the game history", function() {
      var bridge = Ravenbridge();
      bridge.create();
      var data;
      var socket = {
        emit: function(message, _data) {
          data = _data;
        }
      };
      var player = {};
      spyOn(socket, 'emit').andCallThrough();
      bridge.addPlayer(socket, player);
      expect(socket.emit).toHaveBeenCalledWith('update', jasmine.any(Object));
      expect(data.history).toBeDefined();
      expect(data.history.length).toBe(5);
      for (var i = 0; i < 5; i++) {
        var entry = JSON.parse(data.history[i]);
        expect(entry.type).toBe(h.C.PLACEMENT);
        expect(entry.player).toBe(h.C.STATE);
        expect(entry.position).toBe(Position(h.C.CAPITAL)(0).asKey());
      }
    });
  });
});

return {
  name: 'ravenbridge_spec'
};
});
