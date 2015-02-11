exports.default = {
  hosts: function(api) {
    return {

      // HOST which called by ANYLINK.GET.ENDPOINT
      anylink_get_endpoint: {
        name: "HOST_GET_ENDPOINT",
        address: "http://localhost:8080/dummy"
      },

      // HOST which called by ANYLINK.POST.ENDPOINT
      anylink_post_endpoint: {
        name: "HOST_POST_ENDPOINT",
        address: "http://localhost:8080/dummy"
      },

      // HOST which called by ANYLINK.NET.ENDPOINT
      anylink_net_endpoint: {
        name: "HOST_NET_ENDPOINT",
        address: "localhost:25000"
      }

    }
  }
}
