define(['lib/position'], function(Position) {
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

  return BoardController;
});
