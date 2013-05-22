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
    'lib/infowar',
    'lib/helpers'],
    function(_,
      allong,
      ICanHaz,
      Infowar,
      h) {

  var allonges = allong.es;
  var Position = h.Position;
  var History = h.History;
  var InsurgentMove = h.InsurgentMove;
  var StateMove = h.StateMove;

  var ActionsView = function() {
    var $actions;
    return {
      init: function($container) {
        $actions = $container;
      },
      render: function(role, infowar) {
        var $kill = $actions.find("#kill");
        var $turn = $actions.find("#turn");
        var $grow = $actions.find("#grow");
        var $endTurn = $actions.find("#end_turn");

        if (infowar.currentPhase() === h.C.PLAYING) {
          if (role === h.C.STATE) {
            $kill.css('display', 'block');
            $turn.css('display', 'block');
            $grow.css('display', 'none');
            $endTurn.css('display', 'block');
            if (infowar.currentTurn().id() === h.C.STATE) {
              $kill.removeClass('disabled');
              $turn.removeClass('disabled');
              $endTurn.removeClass('disabled');
            } else {
              $kill.addClass('disabled');
              $turn.addClass('disabled');
              $endTurn.addclass('disabled');
            }
          } else if (role === h.C.INSURGENT) {
            $kill.css('display', 'none');
            $turn.css('display', 'none');
            $grow.css('display', 'block');
            $endTurn.css('display', 'block');
            if (infowar.currentTurn().id() === h.C.INSURGENT) {
              $grow.removeClass('disabled');
              $endTurn.removeClass('disabled');
            } else {
              $grow.addClass('disabled');
              $endTurn.addClass('disabled');
            }
          }
        } else {
          $kill.css('display', 'none');
          $turn.css('display', 'none');
          $grow.css('display', 'none');
          $endTurn.css('display', 'none');
        }
      }
    };
  };

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

  var BoardView = function() {
    var $board;
    var controller;

    var clearSelected = function() {
      $board.find(".selected").removeClass("selected").off('click');
      $board.find(".selected").removeClass("selectable").off('click');
      $board.find(".long_move").removeClass("long_move");
      $board.find(".short_move").removeClass("short_move");
    };

    var displayInsurgentPlacements = function() {
      $(".space").removeClass("selectable");
      $(".space.circle0").addClass("selectable");

      var positions = [];
      _.times(h.C.NUM_RANKS, function(i) {
        positions.push(Position(0)(i));
      });

      _.each(positions, function(position) {
        $findSpace(position).addClass('selectable').on('click', function(e) {
          e.stopPropagation();
          controller.placeInsurgent(position.circle, position.rank);
          $(".space").off('click');
          $(".space").removeClass("selectable");
        });
      });
    };

    var displayMovablePieces = function(Move, infowar, controllerMethod) {
      $(".space").removeClass("selectable");
      var positions = infowar.getPositionsByType(infowar.currentTurn().id());

      _.each(positions, function(src) {
        var $space = $findSpace(src);
        $space.addClass('selectable').on('click', function(e) {
          e.stopPropagation();
          $(".space").off('click');
          $(".space").removeClass("selectable");
          $space.addClass("selected");
          var adjacentPositions = _.chain(src.adjacentPositions())
            .filter(function(dest) {
              return src.distanceTo(dest) <= infowar.currentTurn().movementPoints();
            })
            .filter(function(dest) {
              try {
                Move(src)(dest);
                return true;
              } catch (e) {
                if (e === "Invalid move") {
                  return false;
                }
                throw e;
              }
            })
            .value();
          _.each(adjacentPositions, function(dest) {
            var $destSpace = $findSpace(dest);
            var distance = src.distanceTo(dest);
            var _class;
            if (distance === 1) {
              _class = "short_move";
            } else {
              _class = "long_move";
            }
            $destSpace.addClass(_class);
            $destSpace.addClass("selectable")
            $destSpace.on('click', function(e) {
              e.stopPropagation();
              $(".space").off('click');
              $(".space").removeClass("selectable");
              $(".space").removeClass("selected");
              $(".space").removeClass("long_move").removeClass("short_move");
              controllerMethod(src, dest);
            });
          });
        });
      });
    };

    var displayMovableInsurgents = function(infowar) {
      displayMovablePieces(InsurgentMove, infowar, controller.insurgentMove);
    };

    var displayMovableStatePieces = function(infowar) {
      displayMovablePieces(StateMove, infowar, controller.stateMove);
    };

    return {
      init: function($container, _controller) {
        $board = $container;
        controller = _controller;

        var CIRCLES = Infowar.NUM_CIRCLES;
        var SPACES_PER_CIRCLE = Infowar.NUM_RANKS;
        var CAPITAL_INDEX = Infowar.CAPITAL;

        function createSpace(circle, rank) {
          var $template = ich.space({
            id: "space"+circle+"-"+rank,
            class: "space circle" + circle + " rank"+ rank,
            rank: rank,
            circle: circle
          });
          $board.append($template);
        };

        for (var circle_index = 0; circle_index < CIRCLES-1; circle_index++) {
          for (var rank_index = 0; rank_index < SPACES_PER_CIRCLE; rank_index++) {
            createSpace(circle_index, rank_index);
          }
        }
        createSpace(4, 0);
      },
      render: function(role, infowar) {
        _.each(infowar.getPieces(), function(pieces_here, poskey) {
          var position = Position(poskey);
          var groups = _.groupBy(pieces_here, function(piece) { return piece.type() });
          var $space = $findSpace(position).find(".pieces");
          $space.text('');
          _.each(groups[h.C.STATE], function(piece) {
            $space.text($space.text() + "X");
          });
          _.each(groups[h.C.INSURGENT], function(piece) {
            $space.text($space.text() + "O");
          });
        });

        if (infowar.currentPhase() === h.C.SETUP && role === h.C.INSURGENT) {
          displayInsurgentPlacements();
        } else if (infowar.currentPhase() === h.C.PLAYING) {
          var displayMovablePieces = function(infowar) {
            if (infowar.currentTurn().id() === h.C.INSURGENT && role === h.C.INSURGENT) {
              displayMovableInsurgents(infowar);
            } else if (infowar.currentTurn().id() === h.C.STATE && role === h.C.STATE) {
              displayMovableStatePieces(infowar);
            }
          }
          $board.on('click', function() {
            clearSelected();
            displayMovablePieces(infowar);
          });
          displayMovablePieces(infowar);
        }
      }
    };
  };

  var HistoryView = function() {
    var $history;
    return {
      init: function($container) {
        $history = $container;
      },
      render: function(infowar) {
        var history = infowar.history();
        $history.text('');
        _.each(history, function(entry) {
          $entry = ich.history_entry({
            text: entry.toString()
          });
          $history.append($entry);
        });
      }
    };
  };

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
        if (infowar.currentPhase() === h.C.SETUP) {
          message = "SETUP: PLACE INSURGENTS";
        } else if (infowar.currentPhase() === h.C.PLAYING) {
          message = infowar.currentTurn().id() + "'S TURN";
        } else if (infowar.currentPhase() === h.C.GAMEOVER) {
          message = "GAMEOVER";
        } else {
          throw "Invalid phase: " + infowar.currentPhase();
        }
        render(message);
      }
    };
  };

  var BoardController = function() {
    var socket;
    return {
      init: function(_socket) {
        socket = _socket;
      },
      placeInsurgent: function(circle, rank) {
        socket.emit('placeInsurgent', Position(circle)(rank).asKey());
      },
      insurgentMove: function(src, dest) {
        socket.emit('insurgentMove', { src: src.asKey(), dest: dest.asKey() });
      },
      stateMove: function(src, dest) {
        socket.emit('stateMove', { src: src.asKey(), dest: dest.asKey() });
      }
    };
  };

  var boardview = BoardView();
  var historyview = HistoryView();
  var statusview = StatusView();
  var chatview = ChatView();
  var actionsview = ActionsView();
  var boardcontroller = BoardController();
  var chatcontroller = ChatController();
  var role;

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
    chatview.render(user, message);
  }

  $('#end_turn').bind('click', function() {
    if (g_actions_enabled.end_turn) {
      socket.emit('end_turn');
    }
  });

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

  function $findSpace(position) {
    return $("#space"+position.circle+"-"+position.rank).first();
  };
  function $allSpaces() {
    return $(".space");
  }

  boardcontroller.init(socket);
  boardview.init($('#pieces'), boardcontroller);
  historyview.init($('#history'));
  statusview.init($('#dashboard'));
  chatview.init($('#chat'), chatcontroller);
  actionsview.init($('#actions'));
});

