define(['lib/infowar', 'lib/raven/bridge'], function(Infowar, Ravenbridge) {

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
      var game = Ravenbridge.create();
      expect(game).toBeDefined();
      expect(game.initialInsurgents()).toBe(Infowar.INITIAL_INSURGENTS);
    });
  });
});

return {
  name: 'ravenbridge_spec'
};
});
