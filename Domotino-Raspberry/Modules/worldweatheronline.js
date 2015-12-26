module.exports = function (Key, $lat1, $long1, io ) {

    return {
        url:'http://api.wunderground.com',
        key: Key,
        lat1: $lat1,
        long1: $long1,
        io:io,
        callback: function(error,defs,body){

                if (error == null) {
                    defs.callback = function (error, defs, body) {
                        //console.log(body)
                        setTimeout(function () {
                            defs.Get(defs, "conditions")
                        }, 5 * 60 * 1000);
                    }
                    defs.callback(null, defs, body)
                } else {
                    console.log(error)
                }

        },
        Get: function (defs, action) {
            var api_url = defs.url + "/api/" + defs.key + "/" + action + "/q/" + defs.lat1 + "," + defs.long1 + ".json"
            var options = {
                url: api_url,
                "content-type": "application-json",
                json: ""
            };
            var request = require("request");
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log('weather api OK')
                    defs.io(JSON.parse(body))
                    defs.callback(null, defs, body);
                } else {
                    defs.callback(error);
                }
            });
        },
        Read_G: function (body) {
            var obj = JSON.parse(body);
        }

    }

}
