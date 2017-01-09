import http from 'http';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import compress from 'compression';

class Server {

    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.app = express();
        this.app.use(cors());
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(compress());

        //
        if (host === undefined) {
            this.host = 'localhost';
            this.port = '8060';
        }

        //set global error catch
        process.on('uncaughtException', function (err) {
            console.log("ERROR : Uncaught Exception : " + err.stack);
            console.log("FIX IT!")
        });
    }


    /*
     Set the routes.
     */
    setRoutes() {

        this.app.all('/*', (req, res, next) => {
            // CORS headers
            res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            // Set custom headers for CORS
            res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
            if (req.method == 'OPTIONS') {
                res.status(200).end();
            } else {
                next();
            }
        });

        console.log("CWD : " + __dirname);

        this.app.use('/view', express.static('../client/dist'));
        this.app.use('/', require('./routes'));
        this.app.use('*', function (req, res) {
            console.log("Wildcard access path : [" + req.path + "]");
            //TODO : uncomment later.
            res.redirect('/view');
        });

        // If no route is matched by now, it must be a 404
        this.app.use(function (req, res, next) {
            console.log("404 access path : [" + req.path + "]");
            console.log("Req URL :" + req.url);
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
    }

    /*
     Start the server.
     */
    startServer() {
        // var log = require('./utils/logger');
        // log.init();
        console.log("Starting server...");
        this.setRoutes();
        console.log("Routes set...");
        this.app.set('port', this.port);
        this.server = this.app.listen(this.app.get('port'), () => {
            console.log("RFW started on port : " + this.server.address().port);
        })
    }

}

//var Main = new Server('localhost', '8060');
var Main = new Server();
Main.startServer();
