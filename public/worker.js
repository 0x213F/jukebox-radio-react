self.addEventListener('fetch', function(event) {
  event.respondWith(async function() {
    try {
      return await fetch(event.request);
    } catch(error) {
      return {
        system: {
          status: 400,
          message: "Offline",
        },
      };
    }
  }());
});
