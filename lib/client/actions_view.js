define(['underscore', 'lib/constants'], function(_, C) {
  var ActionsView = function() {
    var $actions;
    var boardview; // TODO HACK this view should not know of another view, need to use intermediary model
    var controller;
    var handlers = {};
    return {
      init: function($container, _controller, boardview) {
        $actions = $container;
        controller = _controller;
        handlers['endTurn'] = function(e) {
          e.stopPropagation();
          controller.endTurn();
        };
        handlers['kill'] = function(board) {
          boardview.showKillCandidates(board, controller);
        };
        handlers['grow'] = function(board) {
          boardview.showGrowCandidates(board, controller);
        };
        handlers['interrogate'] = function(board) {
          boardview.showTurnCandidates(board, controller);
        };
      },
      render: function(role, canGrow, board, currentPhase, currentTurn) {
        var $kill = $actions.find("#kill");
        var $interrogate = $actions.find("#interrogate");
        var $grow = $actions.find("#grow");
        var $endTurn = $actions.find("#end_turn");

        var show = function($action) {
          $action.css('display', 'block');
        };
        var hide = function($action) {
          $action.css('display', 'none');
        };
        var disable = function($action) {
          $action.addClass('disabled');
          $action.off('click');
        };
        var enable = function($action, handler) {
          $action.removeClass('disabled');
          $action.on('click', handler);
        };

        if (currentPhase === C.PLAYING) {
          if (role === C.STATE) {
            show($kill);
            show($interrogate);
            hide($grow);
            show($endTurn);
            disable($kill);
            disable($interrogate);
            disable($endTurn);
            if (currentTurn.id() === C.STATE) {
              disable($kill);
              disable($interrogate);
              if (board.getPositionsWithBothTypes().length > 0) {
                if (_.contains(currentTurn.validActions(), C.KILL)) {
                  enable($kill, function(e) {
                    e.stopPropagation();
                    handlers['kill'](board);
                  });
                }
                if (_.contains(currentTurn.validActions(), C.INTERROGATE)) {
                  enable($interrogate, function(e) {
                    e.stopPropagation();
                    handlers['interrogate'](board);
                  });
                }
              } else {
                if (currentTurn.movementPoints() === 0) {
                  controller.endTurn();
                }
              }
              enable($endTurn, handlers['endTurn']);
            } else {
              disable($kill);
              disable($interrogate);
              disable($endTurn);
            }
          } else if (role === C.INSURGENT) {
            hide($kill);
            hide($interrogate);
            show($grow);
            show($endTurn);
            disable($grow);
            disable($endTurn);
            if (currentTurn.id() === C.INSURGENT) {
              if (canGrow && _.contains(currentTurn.validActions(), C.GROW)) {
                enable($grow, function(e) {
                  e.stopPropagation();
                  handlers['grow'](board);
                });
              } else {
                disable($grow);
                if (currentTurn.movementPoints() === 0) {
                  controller.endTurn();
                }
              }
              enable($endTurn, handlers['endTurn']);
            } else {
              disable($grow);
              disable($endTurn);
            }
          }
        } else {
          hide($kill);
          hide($interrogate);
          hide($grow);
          hide($endTurn);
        }
      }
    };
  };

  return ActionsView;
});
