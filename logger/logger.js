'use strict';

const fs = require('fs');
const path = require('path');
const {
    createLogger,
    format,
    transports
} = require('winston');
const {
    combine,
    timestamp,
    label,
    printf
} = format;

const myFormat = printf(({
    level,
    message,
    label,
    timestamp
}) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logDir = 'logs';

const logFormat = combine(
    label({
        label: 'mdb-mailer-service'
    }),
    format.colorize(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    timestamp(),
    myFormat
);

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
    new transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
    new transports.File({
            filename: path.join(logDir, 'app.log')
        })
    ]
});

// Don't log to console in unit test/production
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: logFormat,
    }));
}

module.exports = logger;
