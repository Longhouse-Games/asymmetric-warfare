define(['icanhaz'], function(ICanHaz) {
  var HistoryView = function() {
    var $history;
    return {
      init: function($container) {
        $history = $container;
      },
      render: function(history) {
        $history.text('');
        _.each(history, function(entry) {
          $entry = ich.history_entry({
            text: entry.toString(),
            type: entry.type().toLowerCase()
          });
          $history.prepend($entry);
        });
      }
    };
  };

  return HistoryView;
});
