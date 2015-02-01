var VERTICLE_ID = "ANYLINK.IN.PROCESSOR";

module.exports = {
  loadPriority:  800,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    // should receive request from ANYLINK.SERVER
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // DO SOMETHING HERE
      
      // forward it to ANYLINK.CLIENT via bus
      // var channel = "ANYLINK.[GET|POST|NET].CLIENT";
      var channel = "ANYLINK.GET.CLIENT";
      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: payload.message });
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