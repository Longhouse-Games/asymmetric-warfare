define(['underscore', 'lib/helpers'], function(_, h) {
var Position = h.Position;
var StateMove = h.StateMove;
var StateTurn = h.StateTurn;
var Kill = h.Kill;

describe("state turn", function() {
  var turn;
  beforeEach(function() {
    turn = StateTurn();
  });
  describe("with no previous actions", function() {
    it("should list MOVE, TURN and KILL as valid actions", function() {
      var actions = turn.validActions();
      expect(_.contains(actions, StateTurn.MOVE)).toBe(true);
      expect(_.contains(actions, StateTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, StateTurn.KILL)).toBe(true);
      // TODO
      //expect(actions[1]).toBe("TURN");
    });
    it("should give 2 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(2);
    });
  });
  describe("with a previous 1-point move", function() {
    beforeEach(function() {
      turn.applyMove(StateMove(Position(0)(0))(Position(0)(1)));
    });
    it("should list MOVE, TURN and KILL as valid actions", function() {
      var actions = turn.validActions();
      expect(_.contains(actions, StateTurn.MOVE)).toBe(true);
      expect(_.contains(actions, StateTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, StateTurn.KILL)).toBe(true);
      // TODO
      //expect(actions[1]).toBe("TURN");
    });
    it("should give 1 remaining movement point", function() {
      expect(turn.movementPoints()).toBe(1);
    });
    describe("and a kill move", function() {
      beforeEach(function() {
        turn.applyKill(Kill(Position(0)(0)));
      });
      it("should mark the turn as complete", function() {
        expect(turn.isComplete()).toBe(true);
      });
    });
  });
  describe("with a previous 2-point move", function() {
    beforeEach(function() {
      var move = StateMove(Position(0)(0))(Position(0)(2));
      turn.applyMove(move);
    });
    it("should list TURN and KILL as valid actions", function() {
      var actions = turn.validActions();
      expect(actions.length).toBe(2);
      expect(_.contains(actions, StateTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, StateTurn.KILL)).toBe(true);
      // TODO
      //expect(actions[0]).toBe("TURN");
    });
    it("should give 0 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(0);
    });
    it("should throw if another move is tried", function() {
      move = StateMove(Position(0)(2))(Position(0)(4));
      expect(function() { turn.applyMove(move); }).toThrow("No movement points remaining!");
    });
  });
  describe("with a previous KILL move", function() {
    beforeEach(function() {
      var kill = Kill(Position(0)(0));
      turn.applyKill(kill);
    });
    it("should list MOVE and END_TURN as valid actions", function() {
      var actions = turn.validActions();
      expect(actions.length).toBe(2);
      expect(_.contains(actions, StateTurn.MOVE)).toBe(true);
      expect(_.contains(actions, StateTurn.END_TURN)).toBe(true);
    });
    it("should give 2 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(2);
    });
  });
});
return {
  name: 'state_turn_spec'
};
});
