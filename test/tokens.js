/* eslint-env node, mocha */
'use strict';

process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

const urlpath = '/api/v1/user/login';


chai.should();
chai.use(chaiHttp);

describe('Tokens', () => {

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
        it('it should not POST a login without proper MIME', (done) => {
            chai.request(server)
                .post(urlpath)
                .end((err, res) => {
                    res.should.have.status(415);
                    done();
                });
        });
        it('it should not POST a login without fields', (done) => {
            chai.request(server)
                .post(urlpath)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors[0].should.have.property('path').eql('username');
                    res.body.errors[1].should.have.property('path').eql('password');
                    done();
                });
        });
        it('it should not POST a login without required field', (done) => {
            let userInfo = {
                username: "admin"
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors[0].should.have.property('path').eql('password');
                    done();
                });
        });

        it('it should not POST a login with invalid credentials', (done) => {
            let userInfo = {
                username: "admin",
                "password": "password1",
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql('Invalid credentials');
                    done();
                });
        });

        it('it should POST a login with valid credentials ', (done) => {
            let userInfo = {
                username: "admin",
                password: "password"
            }
            chai.request(server)
                .post(urlpath)
                .send(userInfo)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(true);
                    res.body.should.have.property('message');
                    res.body.should.have.property('token');
                    done();
                });
        });
    });

});
