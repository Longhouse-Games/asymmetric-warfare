define(['lib/helpers'], function(h) {
var InsurgentPiece = h.Pieces.InsurgentPiece;
var StatePiece = h.Pieces.StatePiece;
var Board = h.Board;
var Position = h.Position;

describe("board", function() {
  var board;

  beforeEach(function() {
    board = Board();
  });

  describe("adding a piece", function() {

    it("should throw when given an invalid piece", function() {
      expect(function() { board.addPiece(null); }).toThrow("Invalid board: piece not specified");
    });

    it("should throw when given an invalid position", function() {
      var piece = InsurgentPiece();
      expect(function() { board.addPiece(piece); }).toThrow("Invalid board: position not specified");
    });

    it("should be retrievable", function() {
      var piece = InsurgentPiece();
      var position = Position(3)(3);
      board.addPiece(piece, position);
      expect(board.getPiecesAt(position)[0]).toBe(piece);
    });

    it("should be able to store multiple different pieces on the same square", function() {
      var piece1 = InsurgentPiece();
      var piece2 = StatePiece();
      var piece3 = InsurgentPiece();
      var position = Position(3)(3);
      board.addPiece(piece1, position);
      board.addPiece(piece2, position);
      board.addPiece(piece3, position);
      var pieces = board.getPiecesAt(position);
      expect(pieces.length).toBe(3);
      expect(pieces[0]).toBe(piece1);
      expect(pieces[1]).toBe(piece2);
      expect(pieces[2]).toBe(piece3);
    });
  });

  describe("removing a piece", function() {
    var piece, position;
    beforeEach(function() {
      piece = InsurgentPiece();
      position = Position(3)(3);
      board.addPiece(piece, position);
    });
    it("should remove the piece", function() {
      board.removePiece(piece, position);
      expect(board.getPiecesAt(position)).toBe(undefined);
    });
    it("should remove pieces that are logically the same", function() {
      piece = InsurgentPiece();
      board.removePiece(piece, position);
      expect(board.getPiecesAt(position)).toBe(undefined);
    });
    it("should not remove other pieces", function() {
      var otherPiece = StatePiece();
      var otherPos = Position(3)(4);
      board.addPiece(otherPiece, otherPos);
      board.removePiece(piece, position);
      expect(board.getPiecesAt(otherPos)[0]).toBe(otherPiece);
    });
    it("should not remove other pieces on the same space", function() {
      var otherPiece = StatePiece();
      var otherPos = Position(3)(3);
      board.addPiece(otherPiece, otherPos);
      board.removePiece(piece, position);
      expect(board.getPiecesAt(otherPos)[0]).toBe(otherPiece);
    });
    it("should permit removing and then re-adding", function() {
      board.removePiece(piece, position);
      board.addPiece(piece, position);
      expect(board.getPiecesAt(position)[0]).toBe(piece);
    });
    it("should throw when removing a non-existant piece", function() {
      var otherPos = Position(3)(4);
      expect(function() { board.removePiece(piece, otherPos); }).toThrow("Piece not found at '3,4'");
    });
  });

  describe("getInsurgentPiecesAt", function() {
    one_insurgent = Position(0)(0);
    two_insurgents = Position(1)(0);
    one_of_each = Position(2)(0);

    beforeEach(function() {
      one_insurgent = Position(0)(0);
      two_insurgents = Position(1)(0);
      one_of_each = Position(2)(0);
      board.addPiece(InsurgentPiece(), one_insurgent);
      board.addPiece(InsurgentPiece(), two_insurgents);
      board.addPiece(InsurgentPiece(), two_insurgents);
      board.addPiece(InsurgentPiece(), one_of_each);
      board.addPiece(StatePiece(), one_of_each);
    });
    it("should return solo insurgents", function() {
      var pieces = board.getInsurgentPiecesAt(one_insurgent);
      expect(pieces.length).toBe(1);
      expect(pieces[0].type()).toBe(h.Pieces.INSURGENT_TYPE);
    });
    it("should return multiple insurgents", function() {
      var pieces = board.getInsurgentPiecesAt(two_insurgents);
      expect(pieces.length).toBe(2);
      expect(pieces[0].type()).toBe(h.Pieces.INSURGENT_TYPE);
      expect(pieces[1].type()).toBe(h.Pieces.INSURGENT_TYPE);
    });
    it("should not return state pieces", function() {
      var pieces = board.getInsurgentPiecesAt(one_of_each);
      expect(pieces.length).toBe(1);
      expect(pieces[0].type()).toBe(h.Pieces.INSURGENT_TYPE);
    });
  });
});
return {
  name: 'board_spec'
};
});
