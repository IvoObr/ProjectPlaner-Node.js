'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlengthValidator: 1,
        trim: true
    },
    content: {
        type: String,
        required: true,
        minlengthValidator: 1,
        trim: true
    },
    authorFirstName: {
        type: String,
        required: true,
        minlengthValidator: 1,
        trim: true
    },
    authorLastName: {
        type: String,
        required: true,
        minlengthValidator: 1,
        trim: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

let Project = mongoose.model('Project', ProjectSchema);

module.exports = {Project};
