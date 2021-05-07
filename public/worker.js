self.addEventListener('fetch', function(event) {
  event.respondWith(async function() {
    return {
      system: {
        status: 400,
        message: "Offline",
      },
    };
  }());
});
