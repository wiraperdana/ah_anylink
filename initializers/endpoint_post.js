var VERTICLE_ID = "ANYLINK.POST.ENDPOINT";

var unirest = require('unirest');

module.exports = {
  loadPriority: 1000,
  startPriority: 1000,
  stopPriority: 1000,
  initialize: function(api, next) {

    var HOST_NAME = api.config.hosts.anylink_post_endpoint.name;
    var HOST_ENDPOINT = api.config.hosts.anylink_post_endpoint.address;

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

    // should receive message from ANYLINK.IN.MEDIATOR via bus then send it to HOST
    var channel = VERTICLE_ID;
    api.log(api.moment.now() + " - " + VERTICLE_ID + " > Listening on channel >", "info", channel);
    api.redis.subsciptionHandlers[channel] = function(payload) {

      api.log(api.moment.now() + " - " + VERTICLE_ID + " > Receive message >", "info", payload);

      // CALL HOST
      unirest.post(HOST_ENDPOINT)
        .send({
          message: payload.properties.data
        })
        .end(function(result) {

          if (result.error) {
            api.log(api.moment.now() + " - " + VERTICLE_ID + " > Error >", "info", result.error);
            message = result.error.code;
          } else {
            message = result.body;
          }

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
    }
    next();
  },
  start: function(api, next) {
    next();
  },
  stop: function(api, next) {
    next();
  }
}
