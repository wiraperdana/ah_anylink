var net = require('net');
var uuid = require('node-uuid');
var util = require('util');

var initialize = function(api, options, next){

  //////////
  // INIT //
  //////////

  var type = 'net'
  var attributes = {
    canChat: false,
    logConnections: true,
    logExits: true,
    sendWelcomeMessage: false,
    verbs: []
  }

  var server = new api.genericServer(type, options, attributes);

  //////////////////////
  // REQUIRED METHODS //
  //////////////////////

  server.start = function(next){
    server.server = net.createServer(api.config.servers.net.serverOptions, function(rawConnection){
      handleConnection(rawConnection);
    });
    
    server.server.on('error', function(e){
      api.log('Cannot start socket server @ ' + options.bindIP + ':' + options.port + '; Exiting.', 'emerg');
      api.log(e, 'error');
      process.exit();
    });
    
    server.server.listen(options.port, options.bindIP, function(){
      next();
    });
      
    next();
  }

  server.stop = function(next){
    gracefulShutdown(next);
  }

  server.sendMessage = function(connection, message){
    try {
      connection.rawConnection.write(message + '\r\n');
    } catch(e){
      api.log('socket write error: ' + e, 'error');
    }
  }

  server.sendFile = function(connection, error, fileStream, mime, length){

  };

  server.goodbye = function(connection, reason){

  };

  ////////////
  // EVENTS //
  ////////////

  server.on('connection', function(connection){
    connection.params = {};

    connection.rawConnection.on('data', function(chunk){
          api.log("chunk: ", chunk);

      if(checkBreakChars(chunk)){
        connection.rawConnection.end();
        connection.destroy();
      } else {
        connection.rawConnection.socketDataString += chunk.toString('utf-8').replace(/\r/g, '\n');
        var index;
        while((index = connection.rawConnection.socketDataString.indexOf('\n')) > -1) {
          var data = connection.rawConnection.socketDataString.slice(0, index);
          connection.rawConnection.socketDataString = connection.rawConnection.socketDataString.slice(index + 2);
          data.split('\n').forEach(function(line){
            if(line.length > 0){
              // increment at the start of the request so that responses can be caught in order on the client
              // this is not handled by the genericServer
              connection.messageCount++;
              parseRequest(connection, line);
              
            }
          });
        }
      }
    });

    connection.rawConnection.on('end', function(){
      if(connection.destroyed !== true){
        try { connection.rawConnection.end() } catch(e){}
        connection.destroy();
      }
    });

    connection.rawConnection.on('error', function(e){
      if(connection.destroyed !== true){
        server.log('socket error: ' + e, 'error');
        try { connection.rawConnection.end() } catch(e){}
        connection.destroy();
      }
    });
  });

  server.on('actionComplete', function(connection, toRender, messageCount){
    completeResponse(connection, toRender, messageCount);
  });

  /////////////
  // HELPERS //
  /////////////
  
  var parseRequest = function(connection, line){
    connection.params.action = "proxy_net";
    connection.rawConnection.socketDataString= line.toString();
    server.processAction(connection);
  }

  var handleConnection = function(rawConnection){
    if(api.config.servers.socket.setKeepAlive === true){
      rawConnection.setKeepAlive(true);
    }
    rawConnection.socketDataString = '';
    server.buildConnection({
      id: uuid.v4(),
      rawConnection  : rawConnection,
      remoteAddress  : rawConnection.remoteAddress,
      remotePort     : rawConnection.remotePort
    }); // will emit 'connection'
  }

  var completeResponse = function(connection, toRender){
    if(toRender === true){
      var stringResponse = connection.response;
      if(connection.response.error !== undefined){
        stringResponse = connection.response.error ;
      }
      server.sendMessage(connection, stringResponse);
    }
  }

  // I check for ctrl+c in the stream
  var checkBreakChars = function(chunk){
    var found = false;
    var hexChunk = chunk.toString('hex',0,chunk.length);
//     api.log("hexChunk: "+hexChunk);
    if(hexChunk === 'fff4fffd06'){
      found = true // CTRL + C
    } else if(hexChunk === '04'){
      found = true // CTRL + D
    }
    return found
  }

  var gracefulShutdown = function(next, alreadyShutdown){
    if(!alreadyShutdown || alreadyShutdown === false){
      server.server.close();
    }
    var pendingConnections = 0;
    server.connections().forEach(function(connection){
      if(connection.pendingActions === 0){
        connection.destroy();
      } else {
        pendingConnections++;
        if(!connection.rawConnection.shutDownTimer){
          connection.rawConnection.shutDownTimer = setTimeout(function(){
            connection.destroy();
          }, attributes.pendingShutdownWaitLimit);
        }
      }
    });
    if(pendingConnections > 0){
      server.log('waiting on shutdown, there are still ' + pendingConnections + ' connected clients waiting on a response', 'notice');
      setTimeout(function(){
        gracefulShutdown(next, true);
      }, 1000);
    } else if(typeof next === 'function'){ next() }
  }

  next(server);
}

exports.initialize = initialize;