# ah_anylink

gateway adapters template using *www.actionherojs.com*

## Sequences

### IN Sequence: 
ANYLINK.PROXY -> ANYLINK.IN.MEDIATOR -> ANYLINK.ENDPOINT -> HOST

### OUT Sequence: 
HOST -> ANYLINK.ENDPOINT -> ANYLINK.OUT.MEDIATOR -> ANYLINK.PROXY

## Proxies

### ANYLINK_GET_PROXY
ANYLINK_GET_PROXY address is defined in config/routes.js file.

/GET http://0.0.0.0:9000/api/anylink/get

```
curl "http://localhost:9000/api/anylink/get?message=samplemessage"
```

### ANYLINK_POST_PROXY
ANYLINK_POST_PROXY address is defined in config/routes.js file.

/POST http://0.0.0.0:9000/api/anylink/post

```
curl -d "message=samplemessage" "http://localhost:9000/api/anylink/post
```

### ANYLINK_NET_PROXY
ANYLINK_NET_PROXY address is defined in config/servers/net.js file.

TCP 0.0.0.0:9001

```
telnet localhost 9001
<sample message>
```

## Hosts

Hosts addresses are defined in config/hosts.js file.

### DJP Host
TCP 10.252.1.47:8277

### Sprint Network Management
/GET http://172.17.0.21:80/djp/networkMgt.php?{infoCode}


