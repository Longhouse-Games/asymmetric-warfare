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
        handlers['endTurn'] = function() {
          controller.endTurn();
        };
        handlers['kill'] = function(board) {
          boardview.showKillCandidates(board, controller);
        };
        handlers['grow'] = function(board) {
          boardview.showGrowCandidates(board, controller);
        };
        handlers['turn'] = function(board) {
          boardview.showTurnCandidates(board, controller);
        };
      },
      render: function(role, canGrow, board, currentPhase, currentTurn) {
        var $kill = $actions.find("#kill");
        var $turn = $actions.find("#turn");
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
            show($turn);
            hide($grow);
            show($endTurn);
            if (currentTurn.id() === C.STATE) {
              disable($kill);
              disable($turn);
              if (board.getPositionsWithBothTypes().length > 0) {
                if (_.contains(currentTurn.validActions(), C.KILL)) {
                  enable($kill, function(e) { handlers['kill'](board); });
                }
                if (_.contains(currentTurn.validActions(), C.INTERROGATE)) {
                  enable($turn, function(e) { handlers['turn'](board); });
                }
              }
              enable($endTurn, handlers['endTurn']);
            } else {
              disable($kill);
              disable($turn);
              disable($endTurn);
            }
          } else if (role === C.INSURGENT) {
            hide($kill);
            hide($turn);
            show($grow);
            show($endTurn);
            if (currentTurn.id() === C.INSURGENT) {
              if (canGrow && _.contains(currentTurn.validActions(), C.GROW)) {
                enable($grow, function(e) { handlers['grow'](board); });
              } else {
                disable($grow);
              }
              enable($endTurn, handlers['endTurn']);
            } else {
              disable($grow);
              disable($endTurn);
            }
          }
        } else {
          hide($kill);
          hide($turn);
          hide($grow);
          hide($endTurn);
        }
      }
    };
  };

  return ActionsView;
});
