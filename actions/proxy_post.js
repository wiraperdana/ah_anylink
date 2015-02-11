var VERTICLE_ID = "ANYLINK.POST.PROXY";

// var inputs = {
//   message: {
//     required: true,
//     formatter: function(param){
//       return String(param);
//     },
//   }
// };

exports.action = {
  name:                   'proxy_post',
  description:            'proxy_post',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {},

  run: function(api, connection, next){

    var sequence_name = "SEQUENCE_NAME";
    api.log("########################################################################################################################");
    api.log(api.moment.now() + " - " + sequence_name + " Sequence");
    api.log("########################################################################################################################");
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Request > ", "info", connection.params);

    // RECEIVE REQUEST PARAMETERS
    var message = connection.params.message;

    // forward it to ANYLINK.MEDIATOR via bus
    var route = function(payload) {

      // ------------- DO SOMETHING HERE -------------

      // ---------------------------------------------

      var channel = "ANYLINK.IN.MEDIATOR";
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

    var payload = {
      serverId: api.id,
      serverToken: api.config.general.serverToken,
      connectionId: connection.id,
    };
    payload = route(payload);
    payload = transform(payload);

    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish >", "info", payload);
    api.redis.publish(payload);

    // SUBSCRIBE TO "ANYLINK.POST.PROXY" CHANNEL
    var channel = VERTICLE_ID + "/" + connection.id;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Subscribe >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive >", "info", payload);

      connection.rawConnection.responseHeaders.push(['Content-Type', 'text/plain']);
      connection.response = payload.properties.data;

      api.redis.client.unsubscribe(channel);

      next(connection, true);
         
    }
  }
};