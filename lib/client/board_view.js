define(['underscore', 'allong.es', 'lib/constants', 'lib/position', 'lib/insurgent_move', 'lib/state_move'],
    function(_, allong, C, Position, InsurgentMove, StateMove) {

  function $findSpace(position) {
    return $("#space"+position.circle+"-"+position.rank).first();
  };

  function highlightSpace($space) {
    var data = $space.data('maphilight') || {};
    console.log(data);
    data.alwaysOn = true;
    data.fill = true;
    data.stroke = true;
    data.strokeColor = "00FF00";
    data.fillColor = "008800";
    $space.data('maphilight', data).trigger('alwaysOn.maphilight');
  };

  function markSelected($space) {
    var data = $space.data('maphilight') || {};
    console.log(data);
    data.alwaysOn = true;
    data.fill = true;
    data.stroke = true;
    data.strokeColor = "FF0000";
    data.fillColor = "880000";
    $space.data('maphilight', data).trigger('alwaysOn.maphilight');
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

    var clearListeners = function() {
      $spaces = $(".space").off('click');
    };

    var clearSelected = function() {
      //Remove hilight from all maphilights
      $spaces = $(".space");
      $spaces.each(function(index, space) {
        var $space = $(space);
        var data = $space.data('maphilight') || {};
        data.alwaysOn = false;
        data.fill = false;
        data.stroke = false;
        $space.data('maphilight', data).trigger('alwaysOn.maphilight');
      });
    };

    var displayInsurgentPlacements = function() {

      var positions = [];
      _.times(C.NUM_RANKS, function(i) {
        positions.push(Position(0)(i));
      });

      _.each(positions, function(position) {
        var $space = $findSpace(position);
        console.log("hilighting position: " + position.asKey());
        console.log($space);
        highlightSpace($space);
        $space.on('click', function(e) {
          clearSelected();
          clearListeners();
          console.log("Clicked on position " + position.asKey());
          e.stopPropagation();
          controller.placeInsurgent(position.circle, position.rank);
        });
      });
    };

    var displayMovablePieces = function(Move, board, currentTurn, remainingMovementPoints, controllerMethod) {
      clearSelected();
      var positions = board.getPositionsByType(currentTurn);

      _.each(positions, function(src) {
        var $space = $findSpace(src);
        highlightSpace($space);
        $space.on('click', function(e) {
          e.stopPropagation();
          $(".space").off('click');
          clearSelected();
          clearListeners();
          markSelected($space);
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
            highlightSpace($destSpace);
            $destSpace.on('click', function(e) {
              e.stopPropagation();
              clearSelected();
              clearListeners();
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
        highlightSpace($space);
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
      $selection_map = $("#selection_map"); //handles selections. also hilights
      $board = $("#board"); //shows pieces on the board

      var CIRCLES = C.NUM_CIRCLES;
      var SPACES_PER_CIRCLE = C.NUM_RANKS;
      var CAPITAL_INDEX = C.CAPITAL;

      function createSpace(circle, rank) {
        var $template = ich.piecemarker({
          rank: rank,
          circle: circle,
          rotate: circle === 4 ? 0 : (rank + Math.floor(circle/2)) % 12,
          half: circle % 2 === 1 ? "-5" : ""
        });
        $board.append($template);
      };

      for (var circle_index = 0; circle_index < CIRCLES-1; circle_index++) {
        for (var rank_index = 0; rank_index < SPACES_PER_CIRCLE; rank_index++) {
          createSpace(circle_index, rank_index);
        }
      }
      createSpace(4, 0);
      $('#selection_layer').maphilight({
        fade: false,
        fill: false,
        stroke: false,
        alwaysOn: false,
        fillOpacity: 0.3,
        strokeWidth: 3,
        strokeColor: '00FF00',
        wrapClass: 'board_position'
      });
    };

    var render = function(role, board, currentPhase, currentTurn, remainingMovementPoints) {
      clearSelected();
      clearListeners();
      $('#board .pieces').text(''); // clear all X and O markers
      _.each(board.getPieces(), function(pieces_here, poskey) {
        var position = Position(poskey);
        var groups = _.groupBy(pieces_here, function(piece) { return piece.type() });
        var $marker = $("#marker"+position.circle+"-"+position.rank + " .pieces").first();
        $marker.text('');
        _.each(groups[C.STATE], function(piece) {
          $marker.text($marker.text() + "X");
        });
        _.each(groups[C.INSURGENT], function(piece) {
          $marker.text($marker.text() + "O");
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
