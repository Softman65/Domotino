module.exports = function (app) {
	
	return {
		http: {
			options : {
				host: '192.168.1.249',
				port: 80,
				path: ''
			},
			response: function (resp) {
				//app._console("client arrival ....");
				resp.on('data', function (chunk) {
					//app._console("client redirect .... ");
					app.grow.http.res.writeHead(200, { 'Content-Type': 'text/plain' });
					app.grow.http.res.writeHead(200, { 'Content-Type': 'text/plain' });
					app.grow.http.res.write(chunk.toString('utf8'));
					app.grow.http.res.end();
					
					App._console("redirect OK ");
					App._console(chunk.toString('utf8'))
				});
			},
			go: function (options, queryObject, _callback, res) {
				
				var url = "http://" + options.host + queryObject
				app._console(url);

				//app._request({
				//	url: url ,
				//	json: true
				//}, function (error, response, body) {
				//	
				//	if (!error && response.statusCode === 200) {
				//		console.log(body) // Print the json response
				//		_callback
				//	}
				//})

				
				app.http.res = res
				options.path = queryObject
				
				app._http.get(options, _callback)
                .on("error", function (e) {
					app._console("Got error: " + e.message);
				});

			},
			res: null
		},
		Data: {
			Finicio : app.moment(new Date("11/10/2015")),
			Lecturas:[],
		},
		Config: {
			sensores: function (entrada, salida, calefaccion, ventilador, luz , humidificador) {
				return [entrada, salida, calefaccion, ventilador, luz , humidificador]
			},
			senToUrl: function (output) {
				var ret = "/D" 
				for (n = 0; n < output.length; n++) {
					ret += "/" + output[n]
				}
				ret += "/F"
				app._console(ret)
				return ret
			},
			Periodos: [
				{ title: 'Semillado'  , dias: 10, T: 28  , H: 100 , Vt : { p: 0, t: 0 } , Lz: 13 },
				{ title: 'Crecimiento', dias: 90, T: 21 , H: 80 , Vt : { p: 100, t: 24 } , Lz: 24 },
				{ title: 'Floración'  , dias: 90, T: 28 , H: 60 , Vt : { p: 50, t: 12 } , Lz: 12 },
				{ title: 'Secado'     , dias: 10, T: 28 , H: 10 , Vt : { p: 0, t: 0 } , Lz: 0 },
			]
		
		},
		Initialize: function () {
		
		},
		Periodo: function (params) {
			var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7;
			var date = new Date() 
			timediff= date - params.Data.Finicio
			Dias = Math.floor(timediff / day);
			//app._console(Dias)
			var P = 99
			var n = 0
			var DiasT = 0
			
			for (n = 0; n < params.Config.Periodos.length; n++) {
				DiasT = DiasT + params.Config.Periodos[n].dias
				//app._console(DiasT)
				if (Dias <= DiasT && P == 99) {
					P = n
					
				}
			}
			return P
		},
		Lecturas: {
			toUrl: function () { 
			
			} 
		
		},
		readData: function (params, T, H) {
			var periodo = params.Config.Periodos[params.Periodo(params)]
			var entrada = 0
			var salida = 0
			var calefaccion = 0
			var ventilador = 0
			var luz = 0
			var humidificador = 0
			
			var Tabs = Math.round(Math.abs( (periodo.T * 1 - T * 1) * 10))
			app._console(Tabs)
			app._console(periodo.T)
			app._console(T)
			if (Tabs > 100) {
				Tabs= 100
			}


			if (periodo.Lz > 0) {
				//averiguar las horas encendido
				hour = 1000 * 60 * 60
				date = new Date()
				ahora = new Date()
				date.setHours(0, 0, 0, 0)

				timediff = ahora - date
				Horas = Math.floor(timediff / hour);
				app._console(date.toString())
				app._console(ahora.toString())
				app._console(periodo.Lz - Horas)
				if (Horas <= periodo.Lz) {
					//Encender Luz
					luz = 1
				}

			} else {
					//Apagar Luz
					luz = 0
			}
			//si la humedad > ideal
			if (H > periodo.H) {
				//apagar Humidificador
				humidificador = 0
			} else {
				//encender Humidificador
				humidificador = 1
			}

			//si la temperatura es menor a la ideal
			if (T < periodo.T) {

				//encender calefacción (Aumentar Temperatura)
				calefaccion = Tabs

				if (H < periodo.H) {
					//encender humidificador
					humidificador = 1
				}
			} else {
				//si la temperatura es mayor o igual que la ideal
				if (T >= periodo.T) {
					
					//enfriar ambiente
					entrada = Tabs

					if (H <= periodo.H) {
						//encender Humidificador
						humidificador = 1
					}
				}
			}

			app._console(params.Config.Periodos[params.Periodo(params)].title)
			params.Data.Lecturas = params.Config.sensores(entrada, salida, calefaccion, ventilador, luz , humidificador);
			return params.Data.Lecturas
		}
	};
}
