'use strict';

require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const colors = require('colors');

const {mongoose} = require('./db/mongoose');
const {Project} = require('./models/project-model');
const {User} = require('./models/user-model');
const {xAuth} = require('./constants/constants');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* Project Requests */

app.post('/projects',  (request, response) => {       // authenticate,
    let project = new Project({
        title: request.body.title,
        content: request.body.content,
        authorFirstName: 'I',                         // request.user.firstName
        authorLastName: 'O',                          // request.user.lastName
        // authorId: request.user._id
    });

    console.log(project);

    project.save().then(projectDoc => {
        response.send({projectDoc});
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/projects', (request, response) => {         // authenticate
    Project.find().then(projectDoc => {               // find({_creator: request.user._id }
        response.send({projectDoc});
    }, (error) => {
        response.status(400).send(error);
    });
});

 /* User Requests */

app.post('/users', (request, response) => {
     let body = _.pick(request.body, ['email', 'password', 'name']);
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
