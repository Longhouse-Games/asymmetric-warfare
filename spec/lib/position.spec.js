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

    it("should throw when given a garbage circle", function() {
      expect(function() { position("jkljkl"); }).toThrow("Invalid circle value");
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

    describe("from keys", function() {
      it("should be constructable from a key", function() {
        var key = "2,3";
        expect(position(key).asKey()).toEqual(position(2)(3).asKey());
      });

      it("should throw when given a garbage key", function() {
        expect(function() { position("jkljklj"); }).toThrow("Invalid circle value");
        expect(function() { position("2,jkljklj"); }).toThrow("Invalid rank value");
      });
    });
  });

  describe("as a key", function() {
    it("should convert to a key suitable for indexes", function() {
      var pos = position(2)(3);
      expect(pos.asKey()).toBe("2,3");
    });
  });
});
return {
  name: "position_spec"
};
});
