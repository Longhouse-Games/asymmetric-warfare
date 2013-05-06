define(['lib/position'], function(position) {
describe("Position", function() {
  beforeEach(function() {
    this.addMatchers({
      toBePosition: function(expected) {
        var actual = this.actual.asKey();
        var expected = expected.asKey();
        var notText = this.isNot ? " not" : "";
        this.message = function() {
          return "Expected " + actual + notText + " to be " + expected;
        };
        return actual === expected;
      }
    });
  });

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

  describe("reporting adjacent positions", function() {
    it("should report adjacent positions on the outer circle", function() {
      var positions = position(0)(0).adjacentPositions();
      expect(positions.length).toBe(4);
      expect(positions[0]).toBePosition(position(0)(1));
      expect(positions[1]).toBePosition(position(0)(11));
      expect(positions[2]).toBePosition(position(1)(0));
      expect(positions[3]).toBePosition(position(1)(1));
    });
    it("should report adjacent positions on middle circles", function() {
      var positions = position(1)(0).adjacentPositions();
      expect(positions.length).toBe(6);
      expect(positions[0]).toBePosition(position(0)(0));
      expect(positions[1]).toBePosition(position(0)(11));
      expect(positions[2]).toBePosition(position(1)(1));
      expect(positions[3]).toBePosition(position(1)(11));
      expect(positions[4]).toBePosition(position(2)(0));
      expect(positions[5]).toBePosition(position(2)(1));
    });
    it("should report adjacent positions on the inner circle", function() {
      var positions = position(3)(7).adjacentPositions();
      expect(positions.length).toBe(5);
      expect(positions[0]).toBePosition(position(2)(7));
      expect(positions[1]).toBePosition(position(2)(6));
      expect(positions[2]).toBePosition(position(3)(8));
      expect(positions[3]).toBePosition(position(3)(6));
      expect(positions[4]).toBePosition(position(4)(0));
    });
    it("should report adjacent positions from the capital", function() {
      var positions = position(4)(0).adjacentPositions();
      expect(positions.length).toBe(12);
      for (var i = 0; i < 12; i++) {
        expect(positions[i]).toBePosition(position(3)(i));
      }
    });
  });

  describe("incrementing rank", function() {
    it("should increment normally", function() {
      expect(position.incrementRank(1)).toBe(2);
    });
    it("should cycle past the boundary", function() {
      expect(position.incrementRank(11)).toBe(0);
    });
  });

  describe("decrementing rank", function() {
    it("should decrement normally", function() {
      expect(position.decrementRank(11)).toBe(10);
    });
    it("should cycle past the boundary", function() {
      expect(position.decrementRank(0)).toBe(11);
    });
  });
});
return {
  name: "position_spec"
};
});
