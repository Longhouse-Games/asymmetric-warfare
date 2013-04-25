define([], function() {
  return function(Position, Move) {
    describe("moving within the same circle", function() {
      var circle = 1;
      var make = function(src_rank, dest_rank) {
        var src = Position(circle)(src_rank);
        var dest = Position(circle)(dest_rank);
        return Move(src)(dest);
      };

      it("should permit moving up one space", function() {
        expect(make(1, 2).distance()).toBe(1);
      });

      it("should permit moving down one space", function() {
        expect(make(2, 1).distance()).toBe(1);
      });

      it("should permit moving up two spaces", function() {
        expect(make(1, 3).distance()).toBe(2);
      });

      it("should permit moving down two spaces", function() {
        expect(make(3, 1).distance()).toBe(2);
      });

      it("should not permit moving up three spaces", function() {
        expect(function() { make(1, 4); }).toThrow("Invalid move");
      });

      it("should not permit moving down three spaces", function() {
        expect(function() { make(4, 1); }).toThrow("Invalid move");
      });

      it("should permit moving up across the circle boundaries", function() {
        expect(make(11, 0).distance()).toBe(1);
      });

      it("should permit moving down across the circle boundaries", function() {
        expect(make(0, 11).distance()).toBe(1);
      });
    });

    describe("moving across circles", function() {
      var rank = 0;
      var make = function(src_circle, dest_circle) {
        var src = Position(src_circle)(rank);
        var dest = Position(dest_circle)(rank);
        return Move(src)(dest);
      };

      describe("outwards", function() {
        it("should permit moving one circle with same rank", function() {
          expect(make(2, 1).distance()).toBe(2);
        });
        it("should not permit moving two circles", function() {
          expect(function() {make(3, 1);}).toThrow("Invalid move");
        });
        it("should permit moving one circle with one higher rank", function() {
          var src = Position(2)(1);
          var dest = Position(1)(2);
          expect(Move(src)(dest).distance()).toBe(2);
        });
        it("should permit moving one circle with one higher rank across rank edges", function() {
          var src = Position(2)(11);
          var dest = Position(1)(0);
          expect(Move(src)(dest).distance()).toBe(2);
        });
        it("should not permit moving to a non-adjacent rank", function() {
          var src = Position(2)(2);
          var dest = Position(1)(1);
          expect(function() { Move(src)(dest); }).toThrow("Invalid move");
        });
        it("should not permit moving out of the first circle", function() {
          expect(function() {make(0, -1)}).toThrow("Invalid circle value");
        });
      });

      describe("inwards", function() {
        it("should permit moving in one circle", function() {
          expect(make(1, 2).distance()).toBe(2);
        });
        it("should not permit moving two circles", function() {
          expect(function() {make(1, 3);}).toThrow("Invalid move");
        });
        it("should not permit moving to a non-adjacent rank", function() {
          var src = Position(1)(1);
          var dest = Position(2)(2);
          expect(function() { Move(src)(dest); }).toThrow("Invalid move");
        });
        it("should not permit moving deeper into the last circle", function() {
          expect(function() {make(4, 5)}).toThrow("Invalid circle value");
        });
      });
    });

    it("should not permit src and dest to be the same", function() {
      var src = Position(1)(1);
      var dest = Position(1)(1);
      expect(function() { Move(src)(dest) }).toThrow("Invalid move");
    });
  };
});
