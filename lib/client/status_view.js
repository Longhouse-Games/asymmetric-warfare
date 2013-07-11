define(['icanhaz', 'lib/constants'], function(ICanHaz, C) {
  var StatusView = function() {
    var $status;
    var displayStatusText = function(message) {
      $status.text('');
      var $message = ich.status({text:message});
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
        var message;
        if (currentPhase === C.SETUP) {
          message = "SETUP: PLACE INSURGENTS";
        } else if (currentPhase === C.PLAYING) {
          message = currentTurn + "'S TURN";
        } else if (currentPhase === C.GAMEOVER) {
          message = "GAMEOVER";
        } else {
          throw "Invalid phase: " + currentPhase;
        }
        displayStatusText(message.toUpperCase());
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
