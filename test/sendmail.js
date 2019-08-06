/* eslint-env node, mocha */
'use strict';

process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

const urlpath = '/api/v1/mailer/send';
const tokenUrlpath = '/api/v1/user/login';

// Open https://emailfake.com/channel3/ & set this email to view email
const fakeEmail = "mdbtest@worksmail.ga";
let token;

chai.should();
chai.use(chaiHttp);

describe('Send Mail', () => {

    describe('/GET ' + urlpath, () => {
        it('it should not make GET request', (done) => {
            chai.request(server)
                .get(urlpath)
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
    });
    describe('/POST ' + urlpath, () => {
        it('it should not POST a send mail without proper MIME', (done) => {
            chai.request(server)
                .post(urlpath)
                .end((err, res) => {
                    res.should.have.status(415);
                    done();
                });
        });
        it('it should not POST a send mail without fields', (done) => {
            chai.request(server)
                .post(urlpath)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors[0].should.have.property('path').eql('email');
                    res.body.errors[1].should.have.property('path').eql('name');
                    res.body.errors[2].should.have.property('path').eql('saleidentifier');
                    done();
                });
        });
        it('it should not POST a send mail without required field', (done) => {
            let userInfo = {
                "email": fakeEmail
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors[0].should.have.property('path').eql('name');
                    res.body.errors[1].should.have.property('path').eql('saleidentifier');
                    done();
                });
        });

        it('it should not POST a send mail with invalid saleidentifier', (done) => {
            let userInfo = {
                "email": fakeEmail,
                "name": "ACME",
                "saleidentifier": "Winterx"
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors[0].should.have.property('message').eql('should be equal to one of the allowed values');
                    done();
                });
        });

        it('it should POST a send mail without JWT', (done) => {
            let userInfo = {
                "email": fakeEmail,
                "name": "ACME",
                "saleidentifier": "Winter"
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should POST a login with valid credentials to get JWT ', (done) => {
            let userInfo = {
                username: "admin",
                password: "password"
            }
            chai.request(server)
                .post(tokenUrlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(200);
                    token = res.body.token;
                    done();
                });
        });

        it('it should POST a send mail without SENDGRID_API_KEY env', (done) => {
            let userInfo = {
                "email": fakeEmail,
                "name": "ACME",
                "saleidentifier": "Winter"
            }
            chai.request(server)
                .post(urlpath)
                .set('Authorization', 'Bearer ' + token)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });

        it('set SENDGRID_API_KEY env', (done) => {
            //process.env.SENDGRID_API_KEY = '';
            done();
        });

        it('it should POST a send mail with valid user information ', (done) => {
            if (!process.env.SENDGRID_API_KEY) {
                done();
            } else {
                let userInfo = {
                    "email": fakeEmail,
                    "name": "ACME",
                    "saleidentifier": "Winter"
                }
                chai.request(server)
                    .post(urlpath)
                    .set('Authorization', 'Bearer ' + token)
                    .send(userInfo)
                    .end((err, res) => {
                        if (process.env.SENDGRID_API_KEY) {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('success').eql(true);
                        }
                        done();
                    });
            }
        }).timeout(5000);

    });

});
