var VERTICLE_ID = "ANYLINK.OUT.MEDIATOR";

module.exports = {
  loadPriority:  900,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    // forward it to ANYLINK.ENDPOINT via bus
    var route = function(payload) {  

      // ------------- DO SOMETHING HERE -------------

      // ---------------------------------------------

      var channel = "ANYLINK.GET.ENDPOINT";
      payload.messageType = channel;

      return payload;

    }

    // transform payload data
    var transform = function(payload) {

      // ------------- DO SOMETHING HERE -------------

      // ---------------------------------------------

      payload.properties = {
        data: payload.properties.data,
      };

      return payload;

    }

    // should receive request from ANYLINK.CLIENT
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive >", "info", payload);

      payload = route(payload);
      payload = transform(payload);
      
      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish >", "info", payload);
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