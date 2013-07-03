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
      render: function(currentPhase, currentTurn) {
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
        render(message.toUpperCase());
      }
    };
  };

  return StatusView;
});
