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

### GET_HOST
/GET http://localhost:8080/dummy

### POST_HOST
/POST http://localhost:8080/dummy

### NET_HOST
TCP localhost:25000


