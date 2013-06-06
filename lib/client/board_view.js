define(['underscore', 'allong.es', 'lib/constants', 'lib/position', 'lib/insurgent_move', 'lib/state_move'],
    function(_, allong, C, Position, InsurgentMove, StateMove) {

  function $findSpace(position) {
    return $("#space"+position.circle+"-"+position.rank).first();
  };

  function setTransitionProperty($element, value) {
    $element.css('transition', value);
    $element.css('webkitTransition', value);
    $element.css('mozTransition', value);
    $element.css('oTransition', value);
  }

  function clearTransitionProperty($element) {
    $element.css('transition', '');
    $element.css('webkitTransition', '');
    $element.css('mozTransition', '');
    $element.css('oTransition', '');
  }

  function setTextAndFlashOutline($overlay, $flash, text) {
    text = text || "";
    if ($overlay.text() == text) {
      return;
    }
    var oldBackground = $overlay[0].style.background;
    var timeout = 450;
    $overlay.text(text);
    setTransitionProperty($flash, 'background ' + timeout + 'ms');
    $flash.css('background', '#AA3377');
    setTimeout(function() {
      $flash.css('background', oldBackground);
      setTimeout(function() {
        clearTransitionProperty;
      }, timeout);
    }, timeout);
  }

  var BoardView = function() {
    var $board;
    var controller;

    var clearSelected = function() {
      $board.find(".selected").removeClass("selected").off('click');
      $board.find(".selectable").removeClass("selectable").off('click');
      $board.find(".long_move").removeClass("long_move");
      $board.find(".short_move").removeClass("short_move");
    };

    var displayInsurgentPlacements = function() {
      $(".space").removeClass("selectable");
      $(".space.circle0").addClass("selectable");

      var positions = [];
      _.times(C.NUM_RANKS, function(i) {
        positions.push(Position(0)(i));
      });

      _.each(positions, function(position) {
        $findSpace(position).addClass('selectable').on('click', function(e) {
          e.stopPropagation();
          controller.placeInsurgent(position.circle, position.rank);
          $(".space").off('click');
          $(".space").removeClass("selectable");
        });
      });
    };

    var displayMovablePieces = function(Move, board, currentTurn, remainingMovementPoints, controllerMethod) {
      $(".space").removeClass("selectable");
      var positions = board.getPositionsByType(currentTurn);

      _.each(positions, function(src) {
        var $space = $findSpace(src);
        $space.addClass('selectable').on('click', function(e) {
          e.stopPropagation();
          $(".space").off('click');
          $(".space").removeClass("selectable");
          $space.addClass("selected");
          var adjacentPositions = _.chain(src.adjacentPositions())
            .filter(function(dest) {
              return src.distanceTo(dest) <= remainingMovementPoints;
            })
            .filter(function(dest) {
              try {
                Move(src)(dest);
                return true;
              } catch (e) {
                if (e === "Invalid move") {
                  return false;
                }
                throw e;
              }
            })
            .value();
          _.each(adjacentPositions, function(dest) {
            var $destSpace = $findSpace(dest);
            var distance = src.distanceTo(dest);
            var _class;
            if (distance === 1) {
              _class = "short_move";
            } else {
              _class = "long_move";
            }
            $destSpace.addClass(_class);
            $destSpace.addClass("selectable")
            $destSpace.on('click', function(e) {
              e.stopPropagation();
              $(".space").off('click');
              $(".space").removeClass("selectable");
              $(".space").removeClass("selected");
              $(".space").removeClass("long_move").removeClass("short_move");
              controllerMethod(src, dest);
            });
          });
        });
      });
    };

    var displayMovableInsurgents = function(board, currentTurn, remainingMovementPoints) {
      displayMovablePieces(InsurgentMove, board, currentTurn, remainingMovementPoints, controller.insurgentMove);
    };

    var displayMovableStatePieces = function(board, currentTurn, remainingMovementPoints) {
      displayMovablePieces(StateMove, board, currentTurn, remainingMovementPoints, controller.stateMove);
    };

    var showCandidates = function(positions, handler) {
      clearSelected();
      _.each(positions, function(position) {
        var $space = $findSpace(position);
        $space.addClass("selectable");
        $space.on('click', function(e) {
          e.stopPropagation();
          handler(position);
          clearSelected();
        });
      });
    };

    var containsOneOfEach = function(board, position) {
      if (_.find(board.getPiecesAt(position), function(piece) { return piece.type() === C.STATE; }))
      if (_.find(board.getPiecesAt(position), function(piece) { return piece.type() === C.INSURGENT; })) {
        return true;
      }
      return false;
    };

    var init = function($container, _controller) {
      $board = $container;
      controller = _controller;

      var CIRCLES = C.NUM_CIRCLES;
      var SPACES_PER_CIRCLE = C.NUM_RANKS;
      var CAPITAL_INDEX = C.CAPITAL;

      function createSpace(circle, rank) {
        var $template = ich.space({
          id: "space"+circle+"-"+rank,
          class: "space circle" + circle + " rank"+ rank,
          rank: rank,
          circle: circle
        });
        $board.append($template);
      };

      for (var circle_index = 0; circle_index < CIRCLES-1; circle_index++) {
        for (var rank_index = 0; rank_index < SPACES_PER_CIRCLE; rank_index++) {
          createSpace(circle_index, rank_index);
        }
      }
      createSpace(4, 0);
    };

    var render = function(role, board, currentPhase, currentTurn, remainingMovementPoints) {
      $('.space .pieces').text(''); // clear all X and O markers
      _.each(board.getPieces(), function(pieces_here, poskey) {
        var position = Position(poskey);
        var groups = _.groupBy(pieces_here, function(piece) { return piece.type() });
        var $space = $findSpace(position).find(".pieces");
        $space.text('');
        _.each(groups[C.STATE], function(piece) {
          $space.text($space.text() + "X");
        });
        _.each(groups[C.INSURGENT], function(piece) {
          $space.text($space.text() + "O");
        });
      });

      if (currentPhase === C.SETUP && role === C.INSURGENT) {
        displayInsurgentPlacements();
      } else if (currentPhase === C.PLAYING) {
        var displayMovablePieces = function() {
          if (currentTurn === C.INSURGENT && role === C.INSURGENT) {
            displayMovableInsurgents(board, currentTurn, remainingMovementPoints);
          } else if (currentTurn === C.STATE && role === C.STATE) {
            displayMovableStatePieces(board, currentTurn, remainingMovementPoints);
          }
        }
        $board.on('click', function() {
          clearSelected();
          displayMovablePieces();
        });
        displayMovablePieces();
      }
    };

    var revealInsurgents = function(positions) {
      _.each(positions, function(position) {
        var $space = $findSpace(position);
        setTextAndFlashOutline($space, $space, "O!");
      });
    };

    return {
      init: init,
      render: render,
      revealInsurgents: revealInsurgents,
      showKillCandidates: function(board, controller) {
        clearSelected();
        var positions = _.filter(board.getPositionsByType(C.STATE), allong.es.call(containsOneOfEach, board));
        showCandidates(positions, function(position) {
          controller.kill(position);
        });
      },
      showTurnCandidates: function(board, controller) {
        clearSelected();
        var positions = _.filter(board.getPositionsByType(C.STATE), allong.es.call(containsOneOfEach, board));
        showCandidates(positions, function(position) {
          controller.turn(position);
        });
      },
      showGrowCandidates: function(board, controller) {
        clearSelected();
        var positions = _.chain(board.getPositionsByType(C.INSURGENT))
          .map(function(position) { //Collect up all insurgent positions and their adjacencies
            return [position].concat(position.adjacentPositions());
          })
          .reduce(function(memo, positions) { return memo.concat(positions); }, []) // Squash them down to one array
          .uniq(false, function(position) { return position.asKey(); }) //determine uniqueness based on keys
          .value();
        showCandidates(positions, function(position) {
          controller.grow(position);
        });
      }
    };
  };

  return BoardView;
});
