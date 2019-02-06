'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://project-planer:planerpass123@ds111455.mlab.com:11455/project-planer', { useNewUrlParser: true });

module.exports = {mongoose};
