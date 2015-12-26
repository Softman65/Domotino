
// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: http://weeknumber.net/how-to/javascript 

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

var appExpress = {
    _Data: {
        date: null,
        weather: null,
        Sensores: [],
        Lecturas: [],
        lectura: null,
        Medias: []
    },
    _calcMedias:{
        lecturas:0,
        data:0,
        key: null,
        set: function (my, lectura) {
           
            my.data.lecturas = my.data.lecturas + 1
            my.data.T = my.data.T + lectura.T
            my.data.H = my.data.H + lectura.H
            my.data.hx = my.data.hx + lectura.hx

            return my
        },
     //   clear:function(my, key){
     //       my.key = key
     //       my.lecturas =  0
     //       my.data = {}
     //       return my
        //},
        getClear: function(){
            return {
                l:  [[[[[]]]]] ,
                v: {
                    T: [[[[[]]]]],
                    H: [[[[[]]]]],
                    hx: [[[[[]]]]]
                }
            }
        },
        buildKey: function (fecha) {
            var anyo = fecha.getFullYear()
            var mes = fecha.getMonth()
            var day = fecha.getDate()
            var week = fecha.getWeek()
            var dayWeek = fecha.getDay()
            var hour = fecha.getHours()
            return [ anyo , mes , week , day , hour ]
        },
        buildData: function (my, Medias, fecha,lectura) {
          //  var _m = ['anyo','mes','semana','diaSemana','dia','hora']
          //  var _l ={}
          //  var key = my.buildKey(fecha)
            if (Medias[lectura._s] == null) {
                Medias[lectura._s] = my.getClear()
            }
            var _dates = my.buildKey(fecha)

       //    key.forEach( function(i,value){
        //        l[_m[i]] = value 
        //    })
            
            if (Medias[lectura._s].v.T[_dates[0]] == null) {
                Medias[lectura._s].v.T[_dates[0]] = []
                Medias[lectura._s].v.H[_dates[0]] = []
                Medias[lectura._s].v.hx[_dates[0]] = []
            }
            if (Medias[lectura._s].v.T[_dates[0]][_dates[1]] == null) {
                Medias[lectura._s].v.T[_dates[0]][_dates[1]] = []
                Medias[lectura._s].v.H[_dates[0]][_dates[1]] = []
                Medias[lectura._s].v.hx[_dates[0]][_dates[1]] = []
            }
            if (Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]] == null) {
                Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]] = []
                Medias[lectura._s].v.H[_dates[0]][_dates[1]][_dates[2]] = []
                Medias[lectura._s].v.hx[_dates[0]][_dates[1]][_dates[2]] = []
            }
            if (Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]] == null) {
                Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]] = []
                Medias[lectura._s].v.H[_dates[0]][_dates[1]][_dates[2]][_dates[3]] = []
                Medias[lectura._s].v.hx[_dates[0]][_dates[1]][_dates[2]][_dates[3]] = []
            }
            if (Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] == null) {
                Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = []
                Medias[lectura._s].v.H[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = []
                Medias[lectura._s].v.hx[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = []
            }
            
            if (Medias[lectura._s].l[_dates[0]] == null) {
                Medias[lectura._s].l[_dates[0]] = []
            }
            if (Medias[lectura._s].l[_dates[0]][_dates[1]] == null) {
                Medias[lectura._s].l[_dates[0]][_dates[1]] = []
            }
            if (Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]] == null) {
                Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]] = []
            }
            if (Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]] == null) {
                Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]] = []
            }
            if (Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] == null) {
                Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = []
            }

            Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = Medias[lectura._s].v.T[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] + lectura.T
            Medias[lectura._s].v.H[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = Medias[lectura._s].v.H[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] + lectura.H
            Medias[lectura._s].v.hx[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = Medias[lectura._s].v.hx[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] + lectura.hx
            Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] = Medias[lectura._s].l[_dates[0]][_dates[1]][_dates[2]][_dates[3]][_dates[4]] + 1

          //console.log(Medias)
            return Medias


        }
    },
    iout: null,
    ioinit: function (my, portIOclient) {
        my.iout = require('./Modules/io.js')(my, portIOclient)
        return my
    },
    express: require('express'),
    mime : require('mime'),
    path : require('path'),
    //var favicon = require('serve-favicon');
    bodyParser : require('body-parser'),
    cookieParser : require('cookie-parser'),
    routes: require('./routes/index'),
    stylus: require('stylus'),
    app: require('express')(),
    getData : function(obj){
        return obj._Data
    },
    setMedia:function(my,fecha,lectura){

        my._Data.Medias =  my._calcMedias.buildData(my._calcMedias, my._Data.Medias, fecha, lectura )
       

    },
    Weather: require("./Modules/worldweatheronline.js")('ca19d253edc6f89c', 40.8083297, -3.7750366, function (_data) {
        appExpress._Data.date = new Date()
        appExpress._Data.weather = _data
        appExpress.iout('this', appExpress._Data)
    }),

    configure: function (my) {

        my.express.static.mime.define({
            'application/x-font-woff': ['woff'],
            'application/font-woff': ['woff']
        });

        my.app.set('views', my.path.join(__dirname, 'views'));
        my.app.set('view engine', 'jade');
        // uncomment after placing your favicon in /public
        //app.use(favicon(__dirname + '/public/favicon.ico'));
        //app.use(logger('dev'));
        my.app.use(my.bodyParser.json());
        my.app.use(my.bodyParser.urlencoded({ extended: false }));
        my.app.use(my.cookieParser());
        my.app.use(my.stylus.middleware(my.path.join(__dirname, 'public')));
        my.app.use(my.express.static(my.path.join(__dirname, 'public')));

        my.app.use('/', my.routes);

        return my
    },
    init: function (my, iproxy, port, portio, callback ) {
        my.server = my.app.listen(port, function () {

            var host = my.server.address().address
            var port = my.server.address().port
            console.log('Example app listening at http://%s:%s', host, port)
            if (callback != null) {
                callback(my, iproxy, portio)
            }
        })

    },
    go: function (my, iproxy, portWeb,portIOclient, portProxy, callback) {
      
        my.Weather.Get(my.Weather, "geolookup/conditions/astronomy")
        if (callback != null) {
            my.configure(my).ioinit(my, portIOclient).init(my, iproxy, portWeb, portProxy, callback)
        }
    }

}

var ioproxy = {
    connect: function (app,ip,port) {
        io = require('socket.io-client')
        var url = 'http://' + ip + ':' + port
        console.log(url)

        socket = io.connect(url, { reconnect: true });
        socket.on('connect', function (data) {
            console.log('Connected proxy ' + ip + '!');
            socket.on('this', function (_data) {
                console.log(_data)
                app._Data.Sensores = _data.lecturas.Sensores
                console.log('IO data IN Sensores OK')
                app._Data.Sensores.forEach(function (item, i) {
                    if (item != null) {
                        socket.on('Sonda_' + i, function (_sdata) {

                            _l = _sdata.lecturas
                            console.log('proxy ' + _l._s)

                            app._Data.date = new Date()
                            app._Data.Lecturas[_l._s] = _l
                            app._Data.lectura = _l

                            app.setMedia(app , app._Data.date , _l)
                            app.iout('Sonda_' + i, app._Data)
                        })
                    }
                })
            })
        });
    }
}

appExpress.go(appExpress,'192.168.1.230',80 , 8000, 8080, ioproxy.connect)


