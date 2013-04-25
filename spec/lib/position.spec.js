define(['lib/position'], function(position) {
describe("Position", function() {

  describe("creation", function() {
    it("should set circle and rank", function() {
      var pos = position(1)(1);
      expect(pos.circle).toBe(1);
      expect(pos.rank).toBe(1);
    });

    it("should not permit circles less than 0", function() {
      expect(function() {
        position(-1);
      }).toThrow("Invalid circle value");
    });

    it("should not permit circles greater than 4", function() {
      expect(function() {
        position(5);
      }).toThrow("Invalid circle value");
    });

    describe("outer four circles", function() {
      it("should not permit ranks less than 0", function() {
        expect(function() {
          position(1)(-1);
        }).toThrow("Invalid rank value");
      });

      it("should not permit ranks greater than 11", function() {
        expect(function() {
          position(1)(12);
        }).toThrow("Invalid rank value");
      });
    });

    describe("capital circle", function() {
      it("should not permit ranks greater than 0", function() {
        var pos = position(4);
        expect(function() {
          pos(1);
        }).toThrow("Invalid rank value");
      });
    });

  });
});
return {
  name: "position_spec"
};
});
