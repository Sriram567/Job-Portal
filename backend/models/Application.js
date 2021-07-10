const mongoose = require('mongoose');


const ApplicationSchema = mongoose.Schema({
    recruiter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiter' 
     },
    jobApplicant :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobApplicant'
    },
    job:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'job'
    },
    SOP:{
        type : String,
        required : true
    },
    jobRating : {
        type : Number,
        default : 0
    },
    jobApplicantRating : {
        type: Number,
        default : 0
    },
    ApplicationStatus : {
        type : Number,
        default : 0
    },
    DateOfApplication : {
        type: Date,
        default: Date.now
    },
    DateOfJoining : {
        type: Date,
        default : Date.now
    } 
});

const Application = mongoose.model('application',ApplicationSchema);
module.exports =Application;