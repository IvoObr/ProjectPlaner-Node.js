'use strict';

require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const colors = require('colors');
const cors = require('cors');

const {mongoose} = require('./db/mongoose');
const {Project} = require('./models/project-model');
const {User} = require('./models/user-model');
const {xAuth} = require('./constants/constants');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());

app.use(cors({
    origin: '*',
    exposedHeaders: ['x-auth'],
}));

/* Project Requests */

app.post('/projects', authenticate, (request, response) => {
    let project = new Project({
        title: request.body.title,
        content: request.body.content,
        authorFirstName: request.user.firstName,
        authorLastName: request.user.lastName,
        authorId: request.user._id
    });

    project.save().then(projectDoc => {
        response.send({projectDoc});
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/projects',authenticate, (request, response) => {
    Project.find({authorId: request.user._id }).then(projectDoc => {
        response.send({projectDoc});
    }, (error) => {
        response.status(400).send(error);
    });
});

 /* User Requests */

app.post('/users', (request, response) => {
     let body = _.pick(request.body, ['email', 'password', 'firstName', 'lastName']);
     let user = new User(body);

     user.save().then(() => {
         return user.generateAuthToken();
     }).then((token) => {
         response.header(xAuth, token).send({user});
     }).catch(error => {
        response.status(400).send(error);
     });
});

app.post('/users/login', (request, response) => {
   let body = _.pick(request.body, ['email', 'password']);

   User.findByCredentials(body.email, body.password).then(user => {
       return user.generateAuthToken().then(token => {
           response.header(xAuth, token).send({user});
       });
   }).catch(error => {
       response.status(400).send();
    });
});

app.delete('/users/token', authenticate, (request, response) => {
     request.user.removeToken(request.token).then(()=> {
        response.status(200).send();
     }, () => {
         response.status(400).send();
     });
});

app.listen(port, () => {
    console.log('Listening on port'.green, `${port}`.rainbow);
});
