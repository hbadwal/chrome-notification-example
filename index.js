  // Generate the user private channel
  var channel = generateUserChannel();

  $(document).ready(function() {

    // Check if current browser is Chrome
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if(!is_chrome) {
      alert("It works on chrome only");
    }

    // Update the UI with user's private channel and specific curl request for that user
    // All the communication can happen via this private channek with this spefic user
    // Curl request can be used to test whether notification fires or not(fire this via terminal),
    // when user is not focussing the browser window with app
    $('#curl').text('curl "http://ortc-developers2-useast1-s0001.realtime.co/send" --data "AK=B2N59F&AT=SomeToken&C=' + channel + '&M=hello"');
    $('#channel').text(channel);
      
    // Start Chrome Push Manager to obtain device id and register it with Realtime service
    // Service worker will be launched in background to receive the incoming push notifications
    var chromePushManager = new ChromePushManager('./service-worker.js', function(error, registrationId){
      
      if (error) {
        alert(error);
        $("#curl").hide();
        $("#sendButton").attr('disabled',true);
      };

      // Connect to Realtime server
      loadOrtcFactory(IbtRealTimeSJType, function (factory, error) {
        if (error != null) {
          alert("Factory error: " + error.message);
        } else {
           if (factory != null) {
              // Create Realtime Messaging client
              client = factory.createClient();
              client.setClusterUrl('https://ortc-developers.realtime.co/server/ssl/2.1/');
           
              client.onConnected = function (theClient) {
                // client is connected

                // subscribe users to their private channels
                theClient.subscribeWithNotifications(channel, true, registrationId,
                         function (theClient, channel, msg) {
                           // while you are browsing this page you'll be connected to Realtime
                           // and receive messages directly in this callback
                           console.log("Received message from realtime server:", msg);
                         });
              };
           
              // Perform the connection
              // In this example I am using my Realtime application key without any security which
             // i created in my Realtime javascript version framework.
             //http://messaging-public.realtime.co/documentation/starting-guide/mobilePushGCM.html
              client.connect('STQWdM', 'myAuthenticationToken');
           }
         }
      });
    });    
});

// generate a GUID
function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

// Generate the user private channel and save it at the local storage
// so we always use the same channel for each user
function generateUserChannel(){
  userChannel = localStorage.getItem("channel");
  if (userChannel == null || userChannel == "null"){ 
      guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();               
      userChannel = 'channel-' + guid;
      localStorage.setItem("channel", userChannel);
  }
  return userChannel;
}

// Here we are sending a message to the user private channel which will also trigger a push notification which for now has static data.
function send(){
  if (client) {
    client.send(channel, "Triggering a push notification");
  };
}
