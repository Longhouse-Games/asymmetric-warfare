requirejs.config({
  baseUrl: 'client',
  paths: {
    lib: '../lib',
    underscore: "../js/underscore/underscore"
  },
  shim: {
    underscore: {
      exports: '_'
    }
  }
});

require([
    "underscore",
    "../js/allong.es",
    "../js/ICanHaz.min",
    'lib/infowar'],
    function(_,
      allong,
      ICanHaz,
      Infowar) {

  var allonges = allong.es;

  var socket = io.connect(null, {
    'remember transport': false
  });

  function setTransitionProperty($element, value) {
    $element.css('transition', value);
    $element.css('webkitTransition', value);
    $element.css('mozTransition', value);
    $element.css('oTransition', value);
  }

  function clearTransitionProperty($element) {
    $element.css('transition', '');
    $element.css('webkitTransition', '');
    $element.css('mozTransition', '');
    $element.css('oTransition', '');
  }

  function setOverlayText($overlay, $flash, text) {
    text = text || "";
    if ($overlay.text() == text) {
      return;
    }
    var oldBackground = $overlay[0].style.background;
    var timeout = 450;
    $overlay.text(text);
    setTransitionProperty($flash, 'background ' + timeout + 'ms');
    $flash.css('background', '#AA3377');
    setTimeout(function() {
      $flash.css('background', oldBackground);
      setTimeout(function() {
        clearTransitionProperty;
      }, timeout);
    }, timeout);
  }

  function playSound(id) {
    if (g_playSounds) {
      var sound = document.getElementById(id);
      if (sound.readyState === 4) { // HAVE_ENOUGH_DATA - aka it's loaded
        sound.play();
      }
    }
  }

  function notifyPlayer() {
    if ((isWhitePlayer() && g_gameState.isWhiteTurn()) ||
        (isBlackPlayer() && g_gameState.isBlackTurn())) {
      playSound('your_turn');
    }
  }

  function printMessage(user, message) {
    var messageDiv = document.createElement('div');
    messageDiv.innerHTML = '<span style="padding-right: 15px; color: red;">' + user +
      '</span>' + message;
    var messages = document.getElementById('chat_messages');
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  $('#end_turn').bind('click', function() {
    if (g_actions_enabled.end_turn) {
      socket.emit('end_turn');
    }
  });

  socket.on('connect', function() {

    // receive messages
    socket.on('message', function (data) {
      printMessage(data.user, data.message);
      window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on('error', function(msg) {
      printMessage("server", "Error: " + msg);
      console.log("Server error: " + msg);
      window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on('session_error', function(data) {
      console.log("Invalid session. Reloading.");
      location.reload();
    });
    socket.on('user_disconnect', function(data) {
      var userSpan = document.getElementById(data.user);
      if (socket.id != data.user && userSpan && userSpan.parentNode) {
        userSpan.parentNode.remove(userSpan);
      }
    });

    socket.on('role', function(role) {
      g_role = role;
      if (role === WHITE_ROLE) {
        printMessage("server", "You are the White player!");
      } else if (role === BLACK_ROLE) {
        printMessage("server", "You are the Black player!");
      } else {
        printMessage("server", "You are a spectator");
      }
      $('.board').addClass('flickering_board');
      createArmySelector();
      initPawnUpgradeDialog();
    });

    socket.on('num_connected_users', function(numConnectedUsers) {
      if (numConnectedUsers >= 1) {
        $('.board').first().show();
      } else {
        $('.board').first().hide();
      }
    });

    socket.on('getVote', function(vote) {
      var choice = confirm(vote.question);
      socket.emit('vote', {name: vote.name, choice: choice ? 'yes' : 'no'});
    });

    socket.on('user_info', function(userInfo) {
      $('#username').val(userInfo.name);
    });

    socket.on('update', function(updateResponse) {
      if (!updateResponse || !updateResponse.gameState) {
        return;
      }

      // if (g_gameState.getWinner()) {
      //   $("#show_confirm_forfeit").addClass("disabled");
      // }
    });

    // send message functionality
    var messageInput = document.getElementById('chat_input');
    var usernameInput = document.getElementById('username');
    var sendMessage = function() {
      var message = messageInput.value;
      if (!message) {
        return;
      }
      var user = usernameInput.value || 'player';
      // TODO username should be determined on the server.
      socket.emit('message', { user: user, message: message });
      messageInput.value = '';
      messageInput.focus();
    };

    // send messages
    $(messageInput).bind('keypress', function(evt) {
      if (evt.keyCode == 13) { sendMessage(); }
    });
  });

  $(".toggle_sound").bind('click', function() {
    if (g_playSounds) {
      g_playSounds = false;
      $("#toggle_sound").text("Enable Sound");
      $("#volume_control").addClass("volume_control_off");
      $("#volume_control").removeClass("volume_control_on");
    } else {
      g_playSounds = true;
      $("#toggle_sound").text("Disable Sound");
      $("#volume_control").addClass("volume_control_on");
      $("#volume_control").removeClass("volume_control_off");
    }
  });

  function showSettings() {
    $("#settings_dialog").css("visibility", "visible");
    $("#settings_content").css("visibility", "visible");
    $("#settings_dialog").css("z-index", "20000");
  }
  function hideSettings() {
    $("#settings_dialog").css("visibility", "hidden");
    $("#settings_content").css("visibility", "hidden");
    $("#settings_dialog").css("z-index", "0");
  }
  function showForfeitDialog() {
    $("#settings_content").css("visibility", "hidden");
    $("#forfeit_content").css("visibility", "visible");
  }
  function hideForfeitDialog() {
    $("#forfeit_content").css("visibility", "hidden");
    $("#settings_content").css("visibility", "visible");
  }

  $("#settings").bind('click', function() {
    if ($("#settings_dialog").css("visibility") == "visible") {
      hideForfeitDialog();
      hideSettings();
    } else {
      showSettings();
    }
  });
  $("#settings_content .close").bind('click', function() {
    hideSettings();
  });

  $("#show_confirm_forfeit").bind('click', function() {
    if (!g_gameState.getWinner()) {
      showForfeitDialog();
    }
  });
  $("#forfeit_content .close").bind('click', function() {
    hideForfeitDialog();
  });
  $("#confirm_forfeit").bind('click', function() {
    forfeit_game();
    hideForfeitDialog();
    hideSettings();
  });

  function forfeit_game() {
    socket.emit('forfeit');
  }

  $( document ).tooltip();

  function pluralize(value, noun) {
    if (value === 1) {
      return value + " " + noun;
    }
    return value + " " + noun + "s"; // TODO support other noun forms
  };

  (function buildBoard() {
    var CIRCLES = Infowar.NUM_CIRCLES;
    var SPACES_PER_CIRCLE = Infowar.NUM_RANKS;
    var CAPITAL_INDEX = Infowar.CAPITAL;

    var $pieces = $("#pieces");
    function createSpace(circle, rank) {
      var $template = ich.space({
        class: "space space"+circle+"-"+rank+" circle"+circle + " rank"+rank,
        rank: rank,
        circle: circle
      });
      $pieces.append($template);
    };

    for (var circle_index = 0; circle_index < CIRCLES-1; circle_index++) {
      for (var rank_index = 0; rank_index < SPACES_PER_CIRCLE; rank_index++) {
        createSpace(circle_index, rank_index);
      }
    }
    createSpace(4, 0);
  })();
});

