var VERTICLE_ID = "ANYLINK.GET.ENDPOINT";

var HOST_ENDPOINT = "http://localhost:9001/api/anylink/dummy";

var unirest = require('unirest');

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){
    
    // should receive message from ANYLINK.IN.MEDIATOR via bus then send it to HOST
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // DO SOMETHING HERE

      // CALL HOST
      unirest.get(HOST_ENDPOINT)
      .query({
        message: payload.message
      })
      .end(function(result) {
        var response = "";

        if (result.error) {
          api.log(api.moment.now() + " - " + VERTICLE_ID + " > Error >", "info", result.error);
          response = result.error.code;
        }
        else {
          response = result.body;
        }

        // DO SOMETHING HERE

        // forward HOST response to ANYLINK.OUT.MEDIATOR via bus to be processed
        var channel = "ANYLINK.OUT.MEDIATOR";
        api.log(api.moment.now() + " - " + VERTICLE_ID + " > Publish to channel >", "info", { channel: channel, message: response });
        payload.messageType = channel;
        payload.message = response;
        api.log("payload", "debug", payload);
        api.redis.publish(payload);   
      });
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