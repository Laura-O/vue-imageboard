(function() {
    var app = new Vue({
        el: "#main",
        data: {
            domain: "https://s3.amazonaws.com/spicedling/",
            images: ""
        },
        mounted: function() {
            axios.get("/db").then(function(resp) {
                app.images = resp.data;
            });
        }
    });
})();
