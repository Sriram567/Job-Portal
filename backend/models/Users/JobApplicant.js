const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type : String,
        required: true,
        unique: true
    },
    avatar: {
        type:String
    },
    password:{
        type:String,
        required: true
    }

});
const JobApplicant = mongoose.model('jobApplicant', UserSchema);
module.exports = JobApplicant