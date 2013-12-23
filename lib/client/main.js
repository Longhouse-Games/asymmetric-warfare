/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 * http://stackoverflow.com/a/13817235/21593
 */
(function() {
  if (!window.console) {
    window.console = {};
  }
  // union of Chrome, FF, IE, and Safari console methods
  var m = [
    "log", "info", "warn", "error", "debug", "trace", "dir", "group",
    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
  ];
  // define undefined methods as noops to prevent errors
  for (var i = 0; i < m.length; i++) {
    if (!window.console[m[i]]) {
      window.console[m[i]] = function() {};
    }
  }
})();

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}
// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}

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
  var playSounds = true;

  var prefix = /\/(.+\/)play/.exec(window.location.pathname)[1];
  var socket = io.connect(null, {
    'remember transport': false,
    'resource': prefix + 'socket.io'
  });

  function playSound(id) {
    if (playSounds) {
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
  });

  /*
   * Standard raven messages
   */
  socket.on('message', function (data) {
    printMessage(data.user, data.message, data.role);
  });
  socket.on('chat_history', function(chat_messages) {
    _.each(chat_messages, function(chat_message) {
      printMessage(chat_message.user, chat_message.message, chat_message.role);
    });
  });
  socket.on('user_online', function(name) {
    printMessage('server', name + " has come online.", 'server');
  });
  socket.on('user_offline', function(name) {
    printMessage('server', name + " disconnected.", 'server');
  });

  socket.on('error', function(msg) {
    printMessage("server", "Error: " + msg + " - please file a bug report.", 'server');
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

      if (asymwar.winner()) {
        $("#show_confirm_forfeit").addClass("disabled");
        $gameover_banner = ich.gameover({winner: asymwar.winner()});
        $("#side_area").append($gameover_banner);
      }
    }
  });

  socket.on('interrogate-result', function(poskeys) {
    var msg;
    var positions = _.map(poskeys, function(key) { return Position(key); });
    boardview.revealInsurgents(positions);
    if (poskeys.length > 0) {
      msg = "Interrogation revealed " + poskeys.length + " locations!";
    } else {
      msg = "Interrogation revealed no additional insurgents.";
    }
    showNotification(msg);
  });

  function showNotification(msg) {
    $("#notification").text(msg);
  }

  $(".toggle_sound").bind('click', function() {
    if (playSounds) {
      playSounds = false;
      $("#toggle_sound").text("Enable Sound");
      $("#volume_control").addClass("volume_control_off");
      $("#volume_control").removeClass("volume_control_on");
    } else {
      playSounds = true;
      $("#toggle_sound").text("Disable Sound");
      $("#volume_control").addClass("volume_control_on");
      $("#volume_control").removeClass("volume_control_off");
    }
  });

  $(".toggle_history_log").bind('click', function() {
    var $history = $("#history");
    if ($history.css("visibility") == "visible") {
      $("#history").css("visibility", "hidden");
      $("#toggle_history_log").text("Show History Log");
      $("#history_control").removeClass("history_control_on");
      $("#history_control").addClass("history_control_off");
    } else {
      $("#history").css("visibility", "visible");
      $("#toggle_history_log").text("Hide History Log");
      $("#history_control").addClass("history_control_on");
      $("#history_control").removeClass("history_control_off");
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
    showForfeitDialog();
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
  actionsview.init($('#actions'), actionscontroller, boardview, showNotification);
});

