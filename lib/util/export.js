define(['allong.es'], function(allong) {
  var variadic = allong.es.variadic;

  return function(constructor, helpers) {
    var exports = variadic(function(args) {
      return constructor.apply(this, args);
    });

    for (var property in helpers) {
      if (helpers.hasOwnProperty(property)) {
        exports[property] = helpers[property];
      }
    }

    return exports;
  };
});
