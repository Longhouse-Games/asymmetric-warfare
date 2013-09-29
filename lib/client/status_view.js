define(['icanhaz', 'lib/constants'], function(ICanHaz, C) {
  var StatusView = function() {
    var $status;
    var displayStatusText = function(message) {
      $status.text('');
      var $message = ich.status({class:message});
      $status.append($message);
    };
    var displayKilledInsurgents = function(count) {
      $("#killed_insurgents #count").text(count);
    };
    var displayReserveInsurgents = function(count) {
      $("#reserve_insurgents #count").text(count);
    };
    var showReserveInsurgents = function() {
      $("#reserve_insurgents").css('display', 'visible');
    };
    var hideReserveInsurgents = function() {
      $("#reserve_insurgents").css('display', 'none');
    };
    return {
      init: function($container) {
        $status = $container;
        displayStatusText("Connecting to server...");
      },
      render: function(currentPhase, currentTurn, currentRole, killedInsurgents, reserveInsurgents) {
        var _class;
        if (currentPhase === C.SETUP) {
          if (currentRole === C.STATE) {
            _class = "opponents_move";
          } else {
            _class = "setup";
          }
        } else if (currentPhase === C.PLAYING) {
          _class = currentTurn === currentRole ? "your_move" : "opponents_move";
        } else if (currentPhase === C.GAMEOVER) {
          _class = "gameover";
        } else {
          throw "Invalid phase: " + currentPhase;
        }
        displayStatusText(_class);
        displayKilledInsurgents(killedInsurgents);
        if (currentRole === C.INSURGENT) {
          showReserveInsurgents();
          displayReserveInsurgents(reserveInsurgents);
        } else {
          hideReserveInsurgents();
        }
      }
    };
  };

  return StatusView;
});
