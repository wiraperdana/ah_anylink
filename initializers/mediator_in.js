var VERTICLE_ID = "ANYLINK.IN.MEDIATOR";

module.exports = {
  loadPriority:  800,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    // should receive request from ANYLINK.PROXY
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // DO SOMETHING HERE
      
      // forward it to ANYLINK.ENDPOINT via bus
      // var channel = "ANYLINK.[GET|POST|NET].ENDPOINT";``
      var channel = "ANYLINK.GET.ENDPOINT";
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