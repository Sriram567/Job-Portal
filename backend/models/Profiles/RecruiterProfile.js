const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
    recruiter :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiter'
    },
    ContactNumber:{
        type: String,
        required : true
    },
    Bio:{
        type : String,
        required : true
    }
});
const recruiterProfile = mongoose.model('recruiterProfile',  recruiterProfileSchema);
module.exports = recruiterProfile;