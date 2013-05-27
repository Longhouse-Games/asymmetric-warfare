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
        handlers['kill'] = function(infowar) {
          boardview.showKillCandidates(infowar, controller);
        };
        handlers['grow'] = function(infowar) {
          boardview.showGrowCandidates(infowar, controller);
        };
        handlers['turn'] = function(infowar) {
          boardview.showTurnCandidates(infowar, controller);
        };
      },
      render: function(role, infowar) {
        var $kill = $actions.find("#kill");
        var $turn = $actions.find("#turn");
        var $grow = $actions.find("#grow");
        var $endTurn = $actions.find("#end_turn");

        if (infowar.currentPhase() === C.PLAYING) {
          if (role === C.STATE) {
            $kill.css('display', 'block');
            $turn.css('display', 'block');
            $grow.css('display', 'none');
            $endTurn.css('display', 'block');
            if (infowar.currentTurn().id() === C.STATE) {
              $kill.removeClass('disabled');
              $kill.on('click', function(e) { handlers['kill'](infowar); }); // TODO UGH HACK
              $turn.removeClass('disabled');
              $turn.on('click', function(e) { handlers['turn'](infowar); }); // TODO UGH HACK
              $endTurn.removeClass('disabled');
              $endTurn.on('click', handlers['endTurn']);
            } else {
              $kill.addClass('disabled');
              $kill.off('click');
              $turn.addClass('disabled');
              $turn.off('click');
              $endTurn.addClass('disabled');
              $endTurn.off('click');
            }
          } else if (role === C.INSURGENT) {
            $kill.css('display', 'none');
            $turn.css('display', 'none');
            $grow.css('display', 'block');
            $endTurn.css('display', 'block');
            if (infowar.currentTurn().id() === C.INSURGENT) {
              $grow.removeClass('disabled');
              $grow.on('click', function(e) { handlers['grow'](infowar); }); // TODO UGH HACK
              $endTurn.removeClass('disabled');
              $endTurn.on('click', handlers['endTurn']);
            } else {
              $grow.addClass('disabled');
              $grow.off('click');
              $endTurn.addClass('disabled');
              $endTurn.off('click');
            }
          }
        } else {
          $kill.css('display', 'none');
          $turn.css('display', 'none');
          $grow.css('display', 'none');
          $endTurn.css('display', 'none');
        }
      }
    };
  };

  return ActionsView;
});
