define(['lib/infowar'], function(Infowar) {

  var dbgame;

  var old_interface = {
    create: function() {
      return Infowar();
    },
    init: function(factory, _dbgame, egs_notifier) {
      dbgame = _dbgame;
      return this;
    },
    addPlayer: function(socket, user) {
    },
    getPlayerCount: function() {
      return 0;
    },
    getDBGame: function() {
      return dbgame;
    }
  };

  var metadata = {
    name: "Infowar",
    slug: "infowar",
    roles: [
      { slug: 'insurgents', name: 'Insurgents' },
      { slug: 'state', name: 'The State' }
    ]
  }

  old_interface.metadata = metadata;
  return old_interface;
});
