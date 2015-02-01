var moment = require('moment');

module.exports = {
  loadPriority:  100,
  startPriority: 100,
  stopPriority:  100,
  initialize: function(api, next){
    api.moment = moment;

    var now = function() { 
  		return moment().format('DD MMM YYYY HH:mm:ss');
  	};
  	api.moment.now = now;

    next();
  },
  start: function(api, next){
    next();
  },
  stop: function(api, next){
    next();
  }
}