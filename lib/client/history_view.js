define(['icanhaz'], function(ICanHaz) {
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

  return HistoryView;
});
