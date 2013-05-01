define(['lib/infowar'], function(Infowar) {

  return {
    metadata: {
      name: "Infowar",
      slug: "infowar",
      roles: [
        { slug: 'insurgents', name: 'Insurgents' },
        { slug: 'state', name: 'The State' }
      ]
    },
    create: function() {
      return Infowar();
    }
  };
});
