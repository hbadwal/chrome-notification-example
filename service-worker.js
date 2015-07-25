// The service worker running in background to receive the incoming
// push notifications and user clicks

// A push has arrived ...
self.addEventListener('push', function(event) {

  // For now we are just using static data to populate a notification

  var title = 'Popin can send Notifications!!';
  var body = 'Hi! Jeff...';
  var icon = 'img/favicon.jpg';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon
    })
  );
});


// The user has clicked on the notification ...
self.addEventListener('notificationclick', function(event) {
  //close notification
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      var url = 'https://www.popinnow.com/';
    return clients.openWindow(url);
  }));
});
