const mongoose = require('mongoose');
const router = require('../routes/api/auth');

const JobSchema = mongoose.Schema({
     recruiter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiter' 
     },
     email:{
        type: String,
        ref: 'recruiter'
     },
     applicantstatus : {
         type : String,
         default: "Apply"
     },
     numapplied : {
         type: Number,
         default: 0
     },
     Status:{
        type: String,
        default: "Apply"
     },
     Title: {
        type: String,
        required : true
     },
     NoApplicants:{
         type: Number,
         required :true
     },
     NoPositions:{
         type:Number,
         required : true
     },
     DateOfPosting:
     {
        type: Date,
        default: Date.now
     },
     DeadLine:
     {
        type: Date,
        required: true
        // required: true
     },
     
     RequiredSkillSet:[{
       type: String
     }],
     TypeOfJob:
     {
         type: String,
         required: true
     },
     Duration:
     {
         type: Number,
         required : true
     },
     Salary :{
         type: Number,
         required : true
     },
     Rating :{
         type: Number,
         default: 0
     }
    
});

const Jobs = mongoose.model('job', JobSchema);
module.exports = Jobs;