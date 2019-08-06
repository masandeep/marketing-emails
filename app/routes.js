'use strict';

const mailer = require('../mailer/sendmail.js');
const authTokens = require('../auth/tokens.js');
const middleware = require('./middleware.js');

module.exports = function (app) {
    app.post('/api/v1/user/login', authTokens.generateToken);
    app.post('/api/v1/mailer/send', authTokens.verifyToken, 
             middleware.getItemsFromInventory,
             mailer.sendMail);
};
