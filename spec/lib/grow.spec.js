define(['lib/helpers', 'lib/grow'], function(h, Grow) {

var Position = h.Position;

describe("Grow", function() {
  it("should create with a position", function() {
    var position = Position(0)(0);
    var grow = Grow(position);
    expect(grow).toBeDefined();
    expect(grow.position().asKey()).toBe(position.asKey());
  });
});
return {
  name: 'grow_spec'
};
});
