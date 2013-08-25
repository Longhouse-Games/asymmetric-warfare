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
    'lib/asymmetric_warfare',
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
      AsymmetricWarfare,
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
  var Board = h.Board;
  var Pieces = h.Pieces;

  var boardview = BoardView();
  var historyview = HistoryView();
  var statusview = StatusView();
  var chatview = ChatView();
  var actionsview = ActionsView();
  var boardcontroller = BoardController();
  var chatcontroller = ChatController();
  var actionscontroller = ActionsController();
  var role;

  var prefix = /\/(.+\/)play/.exec(window.location.pathname)[1];
  var socket = io.connect(null, {
    'remember transport': false,
    'resource': prefix + 'socket.io'
  });

  function playSound(id) {
    if (g_playSounds) {
      var sound = document.getElementById(id);
      if (sound.readyState === 4 || sound.readyState === 2) { // HAVE_ENOUGH_DATA && HAVE_CURRENT_DATA - aka it's loaded
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

  function printMessage(user, message, role) {
    chatview.render(user, message, role);
  }

  socket.on('connect', function() {

    /*
     * Standard raven messages
     */
    socket.on('message', function (data) {
      printMessage(data.user, data.message, data.role);
    });

    socket.on('error', function(msg) {
      printMessage("server", "Error: " + msg, 'server');
      console.log("Server error: " + msg);
    });

    socket.on('session_error', function(data) {
      console.log("Invalid session. Reloading.");
      printMessage("server", "Invalid session. Please refresh your browser.", 'server');
      location.reload();
    });

    socket.on('userdata', function(userdata) {
      chatcontroller.init(userdata.username, socket);
      printMessage("game", "You are the " + userdata.role + " player!", 'game');
      role = userdata.role;
      $("body").addClass(role);
    });

    socket.on('getVote', function(vote) {
      var choice = confirm(vote.question);
      socket.emit('vote', {name: vote.name, choice: choice ? 'yes' : 'no'});
    });

    /*
     * AsymmetricWarfare messages
     */

    socket.on('update', function(data) {
      if (!data || !data.history) {
        return;
      }
      if (data.state) {
        //We are getting game-state, which means that we don't have a complete
        //history to rebuild the asymwar item. We can't see the whole board.
        var board = Board();
        _.each(data.state.visibleInsurgents, function(poskey) {
          var position = Position(poskey);
          board.addPiece(Pieces.InsurgentPiece(), position);
        });
        _.each(data.state.statePieces, function(poskey) {
          var position = Position(poskey);
          board.addPiece(Pieces.StatePiece(), position);
        });

        var currentTurn = null;
        if (data.state.currentTurn === h.C.STATE) {
          currentTurn = h.StateTurn();
        } else {
          currentTurn = h.InsurgentTurn();
        }
        if (data.state.turnState) {
          currentTurn.fromDTO(data.state.turnState);
        }

        var history = _.map(data.history, function(dto) {
          if (dto.message) {
            return { toString: function() {return dto.message}, type: function() { return dto.type; } };
          }
          return History.fromDTO(dto);
        });
        historyview.render(history);
        boardview.render(role, board, data.state.currentPhase, data.state.currentTurn, currentTurn.movementPoints());
        statusview.render(data.state.currentPhase, data.state.currentTurn, role, data.state.killedInsurgents, null);
        actionsview.render(role, false, board, data.state.currentPhase, currentTurn);
      } else {
        var history = _.map(data.history, function(dto) {
          return History.fromDTO(dto);
        });
        var asymwar = AsymmetricWarfare(history);
        var currentTurn = asymwar.currentTurn() ? asymwar.currentTurn().id() : null;
        var movementPoints = asymwar.currentTurn() ? asymwar.currentTurn().movementPoints() : null;
        boardview.render(
            role,
            asymwar.getBoard(),
            asymwar.currentPhase(),
            currentTurn,
            movementPoints
        );
        actionsview.render(role, asymwar.canGrow(), asymwar.getBoard(), asymwar.currentPhase(), asymwar.currentTurn());
        historyview.render(history);
        statusview.render(asymwar.currentPhase(), currentTurn, role, asymwar.killedInsurgents(), asymwar.reserveInsurgents());
      }

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
  boardview.init($('#pieces'), boardcontroller, $("#table_area"));
  historyview.init($('#history'));
  statusview.init($('#dashboard'));
  chatview.init($('#chat'), chatcontroller);
  actionsview.init($('#actions'), actionscontroller, boardview);
});

