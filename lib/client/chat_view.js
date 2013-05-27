define([], function() {
  var ChatView = function() {
    var $chat;
    var controller;

    var printMessage = function(user, message) {
      var messageDiv = document.createElement('div');
      messageDiv.innerHTML = '<span style="padding-right: 15px; color: red;">' + user +
        '</span>' + message;
      var messages = $chat.find("#messages").get(0);
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    };

    return {
      init: function($container, _controller) {
        $chat = $container;
        controller = _controller;
        var $input = $chat.find('#chat_input');
        $input.bind('keypress', function(e) {
          if (e.keyCode == 13) {
            controller.sendMessage($input.val());
            $input.val('');
            $input.focus();
          };
        });
      },
      render: function(user, message) {
        printMessage(user, message);
      }
    };
  };

  return ChatView;
});
