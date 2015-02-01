var VERTICLE_ID = "ANYLINK.OUT.MEDIATOR";

module.exports = {
  loadPriority:  900,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    // should receive request from ANYLINK.CLIENT
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // DO SOMETHING HERE
      
      // forward it to ANYLINK.PROXY via bus
      // var channel = "ANYLINK.[GET|POST|NET].PROXY/" + message.connectionId;
      var channel = "ANYLINK.NET.PROXY/" + payload.connectionId;
      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: payload.message });
      // var payload = {
      //     messageType : channel,
      //     serverId : message.serverId,
      //     serverToken : message.serverToken,
      //     connectionId: message.connectionId,
      //     message: message
      //   };
      payload.messageType = channel;
      api.redis.publish(payload);
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