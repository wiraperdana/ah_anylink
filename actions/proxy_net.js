var VERTICLE_ID = "ANYLINK.NET.PROXY";

var util = require('util');

// var inputs = {
//   message: {
//     required: true,
//     formatter: function(param){
//       return String(param);
//     },
//   }
// };

exports.action = {
  name:                   'proxy_net',
  description:            'proxy_net',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {},

  run: function(api, connection, next){
    
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Request received > ", "info", connection.params);

    // RECEIVE REQUEST PARAMETERS
    var message = connection.rawConnection.socketDataString;

    // should send the request to ANYLINK.MEDIATOR via bus to be processed
    var channel = "ANYLINK.IN.MEDIATOR";
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: message });
    var payload = {
        messageType : channel,
        serverId : api.id,
        serverToken : api.config.general.serverToken,
        connectionId: connection.id,
        message: message
      };
    api.redis.publish(payload);

    // SUBSCRIBE TO "ANYLINK.NET.PROXY" CHANNEL
    var channel = VERTICLE_ID + "/" + connection.id;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Subscribe to channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive response >", "info", payload);

      // DO SOMETHING HERE

      connection.response = payload.message;

      api.redis.client.unsubscribe(channel);

      next(connection, true);
         
    }

  }
};