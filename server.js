'use strict';

const _ = require('lodash');
const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars')
const expressWinston = require("express-winston");
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const logger = require('./logger/logger.js');
const mailer = require('./mailer/sendmail.js');

const app = express();
const port = process.env.PORT || 8080;
let server;

mailer.init();

app.use(expressWinston.logger({
    winstonInstance: logger,
    msg: "HTTP {{req.method}} {{res.statusCode}} {{req.url}} {{res.responseTime}}ms",
    expressFormat: true,
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "views"));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

new OpenApiValidator({
    apiSpecPath: './public/openapi.yaml',
}).install(app);

// load routes
require('./app/routes.js')(app);

//doc
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    if (!_.isInteger(err.status)) {
        err.status = 500;
    }
    res.status(err.status).json({
        success: false,
        message: err.message,
        errors: err.errors,
    });
});

server = app.listen(port, () => logger.info(`Server is listening on port: ${port}`));

// for testing
module.exports = server;
