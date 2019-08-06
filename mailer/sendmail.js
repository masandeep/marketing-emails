'use strict';

const sgMail = require('@sendgrid/mail');
const logger = require('../logger/logger.js');
const Handlebars = require("handlebars");
const fs = require("fs");
let handlebarTemplate;

function init() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    handlebarTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../views/sales.hbs', 'utf8'), {
        strict: true
    });
}

function sendMail(req, res) {
    let handlebarsHTML, handlebarsData = {
        name: req.body.name,
        season: req.inventory.season,
        banner: req.inventory.banner,
        items: []
    }

    req.inventory.items.forEach(function (item) {
        handlebarsData.items.push({
            discount: item.discount,
            img_src: item.image
        })
    })

    handlebarsHTML = handlebarTemplate(handlebarsData);

    const msg = {
        to: {
            name: req.body.name,
            email: req.body.email,
        },
        from: 'sales@mdb.com',
        subject: 'MDB Clothings sale!',
        html: handlebarsHTML,
    };

    // For runtime testing
    if (process.env.NODE_ENV == 'test') {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    sgMail
        .send(msg)
        .then(() => {
            logger.info('Mail sent successfully.', {
                sender: req.decoded.username,
                receiver: req.body.email
            });

            res.json({
                success: true,
                message: 'Successfully sent email'
            });
        })
        .catch(error => {
            //Extract error msg
            const {
                message,
                code
            } = error;

            logger.info('Failed to send email.', {
                sender: req.decoded.username,
                receiver: req.body.email,
                message: message,
                code: code
            });

            res.status(500).json({
                success: false,
                message: 'Failed to send email'
            });
        });
}

module.exports = {
    init: init,
    sendMail: sendMail,
}
