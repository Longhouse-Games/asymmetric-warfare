define(['icanhaz', 'lib/constants'], function(ICanHaz, C) {
  var StatusView = function() {
    var $status;
    var render = function(message) {
      $status.text('');
      var $message = ich.status({text:message});
      $status.append($message);
    };
    return {
      init: function($container) {
        $status = $container;
        render("Connecting to server...");
      },
      render: function(infowar) {
        var message;
        if (infowar.currentPhase() === C.SETUP) {
          message = "SETUP: PLACE INSURGENTS";
        } else if (infowar.currentPhase() === C.PLAYING) {
          message = infowar.currentTurn().id() + "'S TURN";
        } else if (infowar.currentPhase() === C.GAMEOVER) {
          message = "GAMEOVER";
        } else {
          throw "Invalid phase: " + infowar.currentPhase();
        }
        render(message);
      }
    };
  };

  return StatusView;
});
