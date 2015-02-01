var VERTICLE_ID = "ANYLINK.NET.ENDPOINT";

var net = require('net');

var HOST = '127.0.0.1';
var PORT = 9010;
var RETRY_INTERVAL = 5000;

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    var connected = false;
    var stack = [];
    
    var client = new net.Socket();
    client.on("connect", function() {

        connected = true;
        console.log(api.moment.now() + " - " + VERTICLE_ID + " > Connected to", HOST+":"+PORT);
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
        // client.write('I am Chuck Norris!');

    });

    // Add a "data" event handler for the client socket
    // data is what the server sent to this socket
    client.on("data", function(data) {

        var response = data.toString();
        
        // forward HOST response to ANYLINK.OUT.MEDIATOR via bus to be processed
        var channel = "ANYLINK.OUT.MEDIATOR";
        api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: response });
        var payload = {
          messageType : channel,
          serverId : api.id,
          serverToken : api.config.general.serverToken,
          connectionId: stack.shift(),
          message: response
        };
        api.redis.publish(payload); 

        // Close the client socket completely
        // client.destroy();
        
    });

    client.on('error', function(err){
        console.log(api.moment.now() + " - " + VERTICLE_ID + " > Error >", "info", err);
    })

    // Add a "close" event handler for the client socket
    client.on("close", function() {
        console.log(api.moment.now() + " - " + VERTICLE_ID + " > Connection closed from", HOST+":"+PORT);
        retryConnectOnFailure(RETRY_INTERVAL);
    });

    var retryConnectOnFailure = function(retryInMilliseconds) {
      console.log(api.moment.now() + " - " + VERTICLE_ID + " > Retrying to connect to", HOST+":"+PORT);
      setTimeout(function() {
        if (!connected) 
          client.connect(PORT, HOST);
      }, retryInMilliseconds);
    }

    client.connect(PORT, HOST);
    retryConnectOnFailure(RETRY_INTERVAL);

    // --------------------------------------------------------------------------------------------

    // should receive message from ANYLINK.IN.MEDIATOR via bus then send it to HOST
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // DO SOMETHING HERE
      stack.push(payload.connectionId);

      client.write(payload.message + " " + payload.message +"\n");
    }

    next();
  },
  start: function(api, next){
    next();
  },
  stop: function(api, next){
    next();
  }
}