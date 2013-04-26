define(['lib/helpers'], function(h) {

var InsurgentPiece = h.Pieces.InsurgentPiece;
var StatePiece = h.Pieces.StatePiece;

describe("InsurgentPiece", function() {
  it("should identify as insurgent", function() {
    expect(InsurgentPiece().type()).toBe(h.Pieces.INSURGENT_TYPE);
  });
});

describe("StatePiece", function() {
  it("should identify as state", function() {
    expect(StatePiece().type()).toBe(h.Pieces.STATE_TYPE);
  });
});

return {
  name: 'pieces_spec'
};
});
