'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {auth} = require('../constants/constants');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: (email) => {
               return validator.isEmail(email);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }, tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

/**
* @override mongoose.toJSON()
*/

UserSchema.methods.toJSON = function() {
  let user = this;
  let userObj = user.toObject();

  return _.pick(userObj, ['_id', 'email', 'name']);
};

/**
* @return token
*/
UserSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = auth;
    let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
       return token;
    });
};

/**
* removes token
* @param token
* @return Promise
*/
UserSchema.methods.removeToken = function(token) {
    let user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });

};

/**
* @return User by token
*/
UserSchema.statics.findByToken = function(token) {
   let User = this;
   let decoded;

   try {
       decoded = jwt.verify(token, process.env.JWT_SECRET);
   } catch (error) {
      return new Promise((resolve, reject) => {
          reject();
      });
   }

   return User.findOne({
       '_id': decoded._id,
       'tokens.token': token,
       'tokens.access': auth
   });

};

/**
* @params email
* @params password
* @return Promise user
*/
UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;

    return User.findOne({email}).then(user => {
        if (!user) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, response) => {
               if (response) {
                   resolve(user);
               } else {
                   reject();
               }
            });
        });
    });
};

UserSchema.pre('save', function (next) {
    let user = this;
    const rounds = 17;

    if (user.isModified('password')) {
        bcrypt.genSalt(rounds, (error, salt) => {
           bcrypt.hash(user.password, salt, (error, hash) => {
               user.password = hash;
               next();
           });
        });
    } else {
        next();
    }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
