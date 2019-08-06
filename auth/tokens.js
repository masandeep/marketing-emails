'use strict';

const jwt = require('jsonwebtoken');
const config = require('./config.js');
const logger = require('../logger/logger.js');

// For the given username fetch user from DB
const mockedUsername = 'admin';
const mockedPassword = 'password';

function generateToken(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    let token;

    if (username === mockedUsername && password === mockedPassword) {
        token = jwt.sign({
                username: username
            },
            config.secret, {
                expiresIn: '24h' // expires in 24 hours
            }
        );

        logger.info('Token generated for user: ', username);

        // return the JWT token for the future API calls
        res.json({
            success: true,
            message: 'Authentication successful!',
            token: token
        });
    } else {
        logger.error('Invalid credentials for User: ', username);
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
}

function verifyToken(req, res, next) {
    let token = req.headers['authorization'];

    if (!token) {
        logger.error('Auth token is not supplied');
        return res.status(400).json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                logger.error('Token is not valid');
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                logger.info('Token validated for user: ' + decoded.username);
                req.decoded = decoded;
                next();
            }
        });
    } else {
        logger.error('Auth token is not supplied');
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
}

module.exports = {
    verifyToken: verifyToken,
    generateToken: generateToken,
}
