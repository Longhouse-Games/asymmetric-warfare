requirejs.config({
  baseUrl: 'client',
  paths: {
    lib: '../lib',
    underscore: "../js/underscore/underscore",
    'allong.es': "../js/allong.es",
    icanhaz: "../js/ICanHaz.min"
  },
  shim: {
    underscore: {
      exports: '_'
    }
  }
});

require([
    "underscore",
    "allong.es",
    "icanhaz",
    'lib/infowar',
    'lib/helpers',
    'lib/client/actions_controller',
    'lib/client/actions_view',
    'lib/client/chat_view',
    'lib/client/chat_controller',
    'lib/client/board_view',
    'lib/client/history_view',
    'lib/client/status_view',
    'lib/client/board_controller'],
    function(_,
      allong,
      ICanHaz,
      Infowar,
      h,
      ActionsController,
      ActionsView,
      ChatView,
      ChatController,
      BoardView,
      HistoryView,
      StatusView,
      BoardController) {

  var allonges = allong.es;
  var Position = h.Position;
  var History = h.History;
  var InsurgentMove = h.InsurgentMove;
  var StateMove = h.StateMove;

  var boardview = BoardView();
  var historyview = HistoryView();
  var statusview = StatusView();
  var chatview = ChatView();
  var actionsview = ActionsView();
  var boardcontroller = BoardController();
  var chatcontroller = ChatController();
  var actionscontroller = ActionsController();
  var role;

  var socket = io.connect(null, {
    'remember transport': false,
    'resource': 'raven/socket.io'
  });

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
    chatview.render(user, message);
  }

  socket.on('connect', function() {

    /*
     * Standard raven messages
     */
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
      printMessage("server", "Invalid session. Please refresh your browser.");
      location.reload();
    });

    socket.on('userdata', function(userdata) {
      chatcontroller.init(userdata.username, socket);
      printMessage("game", "You are the " + userdata.role + " player!");
      role = userdata.role;
    });

    socket.on('getVote', function(vote) {
      var choice = confirm(vote.question);
      socket.emit('vote', {name: vote.name, choice: choice ? 'yes' : 'no'});
    });

    /*
     * InfoWar messages
     */

    socket.on('update', function(data) {
      if (!data || !data.history) {
        return;
      }
      var history = _.map(data.history, function(dto) {
        return History.fromDTO(dto);
      });
      var infowar = Infowar(history);
      boardview.render(role, infowar);
      actionsview.render(role, infowar);
      historyview.render(infowar);
      statusview.render(infowar);

      // if (g_gameState.getWinner()) {
      //   $("#show_confirm_forfeit").addClass("disabled");
      // }
    });

    socket.on('interrogate-result', function(poskeys) {
      var positions = _.map(poskeys, function(key) { return Position(key); });
      boardview.revealInsurgents(positions);
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

  boardcontroller.init(socket);
  actionscontroller.init(socket);
  boardview.init($('#pieces'), boardcontroller);
  historyview.init($('#history'));
  statusview.init($('#dashboard'));
  chatview.init($('#chat'), chatcontroller);
  actionsview.init($('#actions'), actionscontroller, boardview);
});

