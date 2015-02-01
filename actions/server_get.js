var VERTICLE_ID = "ANYLINK.GET.SERVER";

// var inputs = {
//   message: {
//     required: true,
//     formatter: function(param){
//       return String(param);
//     },
//   }
// };

exports.action = {
  name:                   'get_server',
  description:            'get_server',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {},

  run: function(api, connection, next){
    
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Request received > ", "info", connection.rawConnection.params.query);

    // RECEIVE REQUEST PARAMETERS
    var message = connection.rawConnection.params.query.message;

    // should send the request to ANYLINK.PROCESSOR via bus to be processed
    var channel = "ANYLINK.IN.PROCESSOR";
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: message });
    var payload = {
        messageType : channel,
        serverId : api.id,
        serverToken : api.config.general.serverToken,
        connectionId: connection.id,
        message: message
      };
    api.redis.publish(payload);

    // SUBSCRIBE TO "ANYLINK.GET.SERVER" CHANNEL
    var channel = VERTICLE_ID + "/" + connection.id;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Subscribe to channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive response >", "info", payload);

      // DO SOMETHING HERE

      connection.rawConnection.responseHeaders.push(['Content-Type', 'text/plain']);
      connection.response = payload.message;

      api.redis.client.unsubscribe(channel);

      next(connection, true);
         
    }

  }
};