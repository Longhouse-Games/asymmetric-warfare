define([], function() {
  var ChatView = function() {
    var $chat;
    var controller;

    var printMessage = function(user, message, role) {
      var $messages = $("#chat_messages");
      $chat = ich.chat_message({user: user, message: message, role: role});
      $messages.append($chat);
      $messages.scrollTop($messages.prop('scrollHeight'));
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
      render: function(user, message, role) {
        printMessage(user, message, role);
      }
    };
  };

  return ChatView;
});
