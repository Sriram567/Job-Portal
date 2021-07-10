const mongoose = require('mongoose');

const jobApplicantProfileSchema = new mongoose.Schema({
    jobApplicant :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobApplicant'
    },
    Skills:[{
        type:String,
        required:true
    }],
    Status:{
        type: Boolean,
        default: false
    },
    Education: [
    {
        InstitutionName:{
            type: String,
            required: true
        },
        StartYear:{
            type: Date,
            required: true
        },
        EndYear:{
            type: String
        }
    }]
    ,
    Rating : {
        type: Number,
        default: 0
    }
});
const jobApplicantProfile = mongoose.model('jobApplicationProfile',  jobApplicantProfileSchema);
module.exports = jobApplicantProfile;