define(['lib/helpers', 'lib/interrogate'], function(h, Interrogate) {

var Position = h.Position;

describe("interrogate", function() {
  it("should create with a position", function() {
    var position = Position(0)(0);
    var interrogate = Interrogate(position);
    expect(interrogate).toBeDefined();
    expect(interrogate.position().asKey()).toBe(position.asKey());
  });
});
return {
  name: 'interrogate_spec'
};
});
