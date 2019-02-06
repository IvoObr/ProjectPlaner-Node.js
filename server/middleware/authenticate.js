'use strict';

const {User} = require('../models/user-model');
const {xAuth} = require('../constants/constants');

let authenticate = (request, response, next) => {
    let token = request.header(xAuth);

    User.findByToken(token).then((user) => {
        if (!user) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }

        request.user = user;
        request.token = token;
        next();
    }).catch((error) => {
        response.status(401).send();
    });
};

module.exports = {authenticate};