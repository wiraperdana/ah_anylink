exports.default = {
  servers: {
    net: function(api){
      return {
        enabled: true,
        // passed to tls.createServer if secure=true. Should contain SSL certificates
        serverOptions: {},
        // Port or Socket
        port: 9001,
        // which IP to listen on (use 0.0.0.0 for all)
        bindIP: '0.0.0.0',
        // Enabple TCP KeepAlive pings on each connection?
        setKeepAlive: false
      }
    }
  }
}