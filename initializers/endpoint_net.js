var VERTICLE_ID = "ANYLINK.NET.ENDPOINT";

var net = require('net');

module.exports = {
  loadPriority: 55000,
  startPriority: 55000,
  stopPriority: 55000,
  initialize: function(api, next) {

    var channel = VERTICLE_ID;

    var HOST_NAME = api.config.hosts.anylink_net_endpoint.name;
    var HOST_ENDPOINT = api.config.hosts.anylink_net_endpoint.address.split(":");
    var HOST = HOST_ENDPOINT[0];
    var PORT = HOST_ENDPOINT[1];
    var RETRY_INTERVAL = 5000;

    // RECEIVE RESPONSE
    var message;

    // forward it to ANYLINK.OUT.MEDIATOR via bus
    var route = function(payload) {

      // ------------- DO SOMETHING HERE -------------

      // ---------------------------------------------

      var channel = "ANYLINK.OUT.MEDIATOR";
      payload.messageType = channel;

      return payload;

    }

    // transform payload data
    var transform = function(payload) {

      // ------------- DO SOMETHING HERE -------------

      // ---------------------------------------------

      payload.properties = {
        data: message,
      };

      return payload;

    }

    var retryConnectOnClose = function(retryInMilliseconds) {
      setTimeout(function() {
        if (!connected) {
          api.log(api.moment.now() + " - " + VERTICLE_ID + " > Connection closed, retrying to connect to", HOST + ":" + PORT);
          initiateConnection();
        }
      }, RETRY_INTERVAL);
    }

    var client;
    var connected = false;
    var initiateConnection = function() {

      client = new net.Socket();
      client.connect(PORT, HOST);

      // Add a "connect" event handler for the client socket
      // this will be called when socket client has succesfully connected to host socket server
      client.on("connect", function() {

        connected = true;
        console.log(api.moment.now() + " - " + VERTICLE_ID + " > Connected to", "info", HOST + ":" + PORT);

      });

      // Add a "data" event handler for the client socket
      // data is what the server sent to this socket
      client.on("data", function(data) {

        message = data.toString();

        api.log(api.moment.now() + " - " + VERTICLE_ID + " > " + HOST_NAME + " says >", "info", message);

        var payload = {
          serverId: api.id,
          serverToken: api.config.general.serverToken,
          connectionId: connection.id,
        };
        payload = route(payload);
        payload = transform(payload);

        api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish >", "info", payload);
        api.redis.publish(payload);

      });

      // Add an "error" event handler for the client socket
      client.on('error', function(err) {

        api.log(api.moment.now() + " - " + VERTICLE_ID + " > Error >", "info", err);
        client.end();

      })

      // Add a "close" event handler for the client socket
      client.on("close", function() {
        client.destroy();
        api.redis.client.unsubscribe(channel);
        connected = false;
        retryConnectOnClose(RETRY_INTERVAL);
      });

      // --------------------------------------------------------------------------------------------

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
      api.redis.subsciptionHandlers[channel] = function(payload) {

        api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive >", "info", payload);

        client.write(payload.properties.data);

      }

    }

    initiateConnection();

    next();
  },
  start: function(api, next) {
    next();
  },
  stop: function(api, next) {
    next();
  }
}
