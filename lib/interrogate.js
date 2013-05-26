define([], function() {
  return function(position) {
    return {
      position: function() { return position; }
    };
  };
});
