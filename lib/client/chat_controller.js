define([], function() {
  var ChatController = function() {
    var username;
    var socket;
    return {
      init: function(_username, _socket) {
        username = _username;
        socket = _socket;
      },
      sendMessage: function(message) {
        if (!message) {
          return;
        }
        socket.emit('message', { user: username, message: message});
      }
    };
  };

  return ChatController;
});
