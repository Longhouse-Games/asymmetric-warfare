define(['lib/helpers', 'lib/kill'], function(h, Kill) {

var Position = h.Position;

describe("Kill", function() {
  it("should create with a position", function() {
    var position = Position(0)(0);
    var kill = Kill(position);
    expect(kill).toBeDefined();
    expect(kill.position().asKey()).toBe(position.asKey());
  });
});
return {
  name: 'kill_spec'
};
});
