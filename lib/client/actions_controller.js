define([], function() {
  var ActionsController = function() {
    var socket;
    return {
      init: function(_socket) {
        socket = _socket;
      },
      endTurn: function() {
        socket.emit('endTurn', null);
      },
      kill: function(position) {
        socket.emit('kill', position.asKey());
      },
      grow: function(position) {
        socket.emit('grow', position.asKey());
      },
      interrogate: function(position) {
        socket.emit('interrogate', position.asKey());
      }
    };
  };

  return ActionsController;
});

