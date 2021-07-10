const express = require('express');
const router = express.Router();
const auth2 = require('../../../middleware/auth2');
const Recruiter = require('../../../models/Users/Recruiter');
const RecruiterProfile = require('../../../models/Profiles/RecruiterProfile');
const JobApplicantProfile = require('../../../models/Profiles/JobApplicantProfile');
const Job = require('../../../models/Jobs');
const { check, validationResult } = require('express-validator');
const { route } = require('../auth2');
const Application = require('../../../models/Application');

//@route  Get api/recruiter

router.get('/me',auth2,async (req, res) =>
{
    try{

        const recruiterProfile = await RecruiterProfile.findOne({recruiter : req.recruiter.id}).populate('recruiter',['name', 'avatar']);
        if(!recruiterProfile)
        {
            return  res.status(400).json({errors : [{msg : "No profile!!"}]});
        }
        else{
            res.json(recruiterProfile);
        }
    }catch(err)
    {
        console.error(err.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});

router.post('/', auth2 , async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors : errors.array()});
    }
    else
    {
        const {
            Bio,
            ContactNumber
        } = req.body;

        const recruiterProfile = {}; 
        recruiterProfile.recruiter = req.recruiter.id;
        if(Bio)
        {
            recruiterProfile.Bio = Bio;
        }
        if(ContactNumber)
        {
            recruiterProfile.ContactNumber = ContactNumber;
        }

        try {
            let finalupdate = await RecruiterProfile.findOne({recruiter : req.recruiter.id});
            if(finalupdate)
            {
                finalupdate = await RecruiterProfile.findOneAndUpdate(
                    {recruiter : req.recruiter.id},
                    { $set : recruiterProfile},
                    {new : true}
                    );
            
                return res.json(finalupdate);
            }else{
                finalupdate = new RecruiterProfile(recruiterProfile);

                await finalupdate.save();
                return res.json(finalupdate);

            }
        }
        catch(error){
            console.error(error.message);
            res.status(500).json({errors: [{error : "Server Error"}]});
        }
    }
})
router.get('/getProfile/:recruiter_id', async(req,res) =>
{
    try{
    const recruiterProfile =await RecruiterProfile.findOne({recruiter : req.params.recruiter_id});

    if(!recruiterProfile)
    {
        return  res.status(400).json({errors : [{msg : "No profile!!"}]});
    }
    else{
        return res.json(recruiterProfile);
    }
    }
    catch(error)
    {
        console.log(error.message);
        return  res.status(400).json({errors : [{msg : "No profile!!"}]});
    }
} );

// Delete request api/profile

router.delete('/',auth2 , async (req,res ) =>
{
    try {
        await RecruiterProfile.findOneAndRemove({recruiter: req.recruiter.id });
        await Recruiter.findByIdAndRemove({_id : req.recruiter.id});

        res.json({errors : [{msg : "User deleted"}]});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errors :[{msg : "Error"}]});
    }
});
module.exports = router;