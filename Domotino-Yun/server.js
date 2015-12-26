var Arduinohttp = require('http');


var http = require('http');

var url = require('url');
var port = process.env.port || 1337;

var App = {
	//_request : require("request"),
    _http: require('http'),
    _io : require('socket.io').listen(8080),
	_console:function (text) {
		_d = new Date()
		console.log("[" + _d.toString() + "]:" + text)
	},
	moment: require('moment'),
	Grow: {
		Work: function (app) {
			return require("./Modules/Grow.js")(app)
		},
		Sensor: 9
	},
	Lecturas: {
	    Sensores:[null,
            { title: "Exterior", Temperatura:true, Humedad:true, Luz: true },
	        { title: "Salon", Temperatura: true, Humedad: false, Luz: true },
            { title: "Cocina", Temperatura: true, Humedad: false, Luz: false },
            { title: "Despacho-1", Temperatura: true, Humedad: false, Luz: false }
	    ],
		Data: [],
		toUrl: function (app, file, array) {
			var string = ""
			var sep = ""
			for (var prop in array) {
				if (string.length > 0) {
					sep = "&"
				}
				string = string + sep + prop + "=" + array[prop];
			}
			app._console("http://" + App.http.options.host + file + "?" + string)
			return file + "?" + string
		}
	},
	io: function(app) { return {
	        send: function (command) {
	            app._io.sockets.emit('this', { lecturas: app.Lecturas });
	        },
	        sendDataSonda: function (nSonda) {
	            app._io.sockets.emit('Sonda_' + nSonda, { lecturas: app.Lecturas.Data[nSonda] , sensores : app.Lecturas.Sensores});
	        }
	    }
	},
	Webserver: function (app) {
		Arduinohttp.createServer(function (req, res) {
			
			var _l = req.url.lastIndexOf("?")
			var queryObject = req.url.substr(_l + 1, req.url.length - 1)
			var file = req.url.substr(0, _l)
			var _diff = 0
			
			app._console("url: " + req.url)
			app._console("Query: " + queryObject)
			app._console("?: " + _l)
			app._console("file:" + file)
			
			if (file == "/data.aspx") {
                var d = new Date()
                var _l = app.Sensor.functions.JSONData(queryObject)

               // _l.Time = d.toLocaleTimeString()
               // _l.Date = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear()
              //  _l.DateTime = _l.Date + " " + _l.Time

				if (_l._Go == 0 && app.Lecturas.Data[_l._s] != null) {
					_diff = app.Lecturas.Data[_l._s].T - _l.T
				}
				
				console.log("parameters:" + _diff + "......." + _l._Go)
				app.Lecturas.Sensores[_l._s].SensorType = _l.type
				
				if ((_diff <= -0.5 || _diff >= 0.5) || _l._Go == 1 || app.Lecturas.Data[_l._s] == null) {
					app.Lecturas.Data[_l._s] = _l
					var _queryObject = app.Lecturas.toUrl( app,'/ws' + file, app.Lecturas.Data[_l._s])
					app.http.go(app.http.options, _queryObject, app.http.response, res)
					if (_l._s == App.Grow.Sensor) {
						//lectura de PC-Garden
						var grow = app.Grow.Work(App)
						
						var output = grow.readData(grow, app.Lecturas.Data[_l._s].T, app.Lecturas.Data[_l._s].H)
						app._console(output)

						var _queryObject = grow.Config.senToUrl(output)
						app._console(_queryObject)
						app._console(grow.http.options)
						grow.http.go(grow.http.options, _queryObject, grow.http.response, res)
					}

				}
				app.io(app).sendDataSonda(_l._s);
				app._console("Socket.io:" + 'sonda_' + _l._s)
			} else {
				app._console("llamada " + file + " no valida")
			}
			
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.write("hi");
			res.end();

		}).listen(port);

		app._io.sockets.on('connection', function (socket) {

		    app.io(app).send('this');

		    //socket.on('private message', function (from, msg) {
		    //    console.log('I received a private message by ', from, ' saying ', msg);
		    //});

		    //socket.on('disconnect', function () {
		    //    app._io.sockets.emit('user disconnected');
		    //});
		});

		app._console("Server Arduino escuchando on port " + port + " Socket.io ok on port 8080" );
	},
	Sensor: {
		functions: {
			JSONData: function (_queryObject) {
				var _values = {}
				var _date = new Date()
				
				_data = _queryObject.split("&")
				for (n = 0; n < _data.length; n++) {
					var _d = _data[n].split("=")
					if (_d[0].length > 3) {
						eval("_values." + _d[0] + "=" + '"' + _d[1] + '"' + "")
					} else {
						eval("_values." + _d[0] + "=" + _d[1] + "")
					}
				}
				if (_values._D == null && _values._M == null) {
					_values._h = _date.getHours()
					_values._n = _date.getMinutes()
					_values._D = _date.getDate()
					_values._M = _date.getMonth() + 1
					_values._Y = _date.getFullYear()
					_values._dm = _date.getDay()


				}
				//var _string
				//for (var prop in _values) {
				//    app._console("_values." + prop + "=" + _values[prop] +"     "+ _date.toDateString());
				//}
				
				return _values
			}

		}
    
	}, http: {
		go: function (options, queryObject, _callback, res) {
			App.http.res = res
			options.path = queryObject
			
			App._http.get(options, _callback)
                .on("error", function (e) {
				App._console("Got error: " + e.message);
			});

		},
		options : {
			host: 'mipaloma.ewebmail.es',
			port: 80,
			path: ''
		},
		response: function (resp, http) {
			//app._console("client arrival ....");
			resp.on('data', function (chunk) {
				//app._console("client redirect .... ");
				App.http.res.writeHead(200, { 'Content-Type': 'text/plain' });
				App.http.res.write(chunk.toString('utf8'));
				App.http.res.end();
				
				App._console("redirect OK ");
				App._console(chunk.toString('utf8'))
			});
		},
		res: null
	}

            
}

App.Webserver(App)



