const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const JobApplicant = require('../../../models/Users/JobApplicant');
const JobApplicantProfile = require('../../../models/Profiles/JobApplicantProfile');
const { check, validationResult } = require('express-validator');
const { route } = require('../auth');
//@route  Get api/jobApplicant
 
router.get('/me',auth,async (req, res) =>
{
    try{
        const jobApplicantProfile = await JobApplicantProfile.findOne({jobApplicant : req.jobApplicant.id}).populate('jobApplicant',['name', 'avatar']);
        if(!jobApplicantProfile)
        {
            console.log("No Profile!!");
            return  res.status(400).json({errors : [{msg : "No profile!!"}]});
        }
        else{
            res.json(jobApplicantProfile);
        }
    }catch(err)
    {
        console.error(err.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});


router.post('/', [auth , [
    check('Skills', 'Skills are required').not().isEmpty()
]], async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors : errors.array()});
    }
    else
    {
        const {
            Skills
        } = req.body;
        const jobApplicantProfile = {};
        jobApplicantProfile.jobApplicant = req.jobApplicant.id;
        
        jobApplicantProfile.Skills = Array.isArray(Skills)
        ? Skills
        : Skills.split(',').map((skill) => ' ' + skill.trim());
      
         
        if(Skills)
        {
            jobApplicantProfile.Skills = Array.isArray(Skills)
        ? Skills
        : Skills.split(',').map((skill) => ' ' + skill.trim());
        }
        try {
            let finalupdate = await JobApplicantProfile.findOne({jobApplicant : req.jobApplicant.id});
            if(finalupdate)
            {
                finalupdate = await JobApplicantProfile.findOneAndUpdate(
                    {jobApplicant : req.jobApplicant.id},
                    { $set : jobApplicantProfile},
                    {new : true}
                    );
            
                return res.json(finalupdate);
            }else{
                finalupdate = new JobApplicantProfile(jobApplicantProfile);

                await finalupdate.save();
                return res.json(finalupdate);

            }
        }
        catch(error){
            console.error(error.message);
            return  res.status(500).json({errors : [{msg : "Server Error"}]});
        }
    }
})
router.get('/getProfile/:id', async(req,res) =>
{
    try{

    const jobApplicantProfile =await JobApplicantProfile.findOne({jobApplicant : req.params.id}).populate('jobApplicant',['name', 'email']);

    if(!jobApplicantProfile)
    {
        return  res.status(400).json({errors : [{msg : "No profile!!"}]});

    }
    else{
        console.log(` is ${jobApplicantProfile}`);
        return res.json(jobApplicantProfile);
    }
    }
    catch(error)
    {   console.log("is is is ");
        console.log(error.message);
        return  res.status(400).json({errors : [{msg : "No profile!!"}]});
    }
} );

// Delete request api/profile

router.delete('/',auth , async (req,res ) =>
{
    try {
        await JobApplicantProfile.findOneAndRemove({jobApplicant: req.jobApplicant.id });
        await JobApplicant.findByIdAndRemove({_id : req.jobApplicant.id});

        res.json({errors : [{msg : "User deleted"}]});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({errors :[{msg : "Error"}]});
    }
});

router.put(
    '/education',
    auth,
    check('InstitutionName','Institution names has to be given').not().isEmpty(),
    check().not().isEmpty(),
    check('StartYear','Start Year has to be given')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const jobApplicantProfile = await JobApplicantProfile.findOne({ jobApplicant: req.jobApplicant.id });
  
        jobApplicantProfile.Education.unshift(req.body);
  
        await jobApplicantProfile.save();
  
        res.json(jobApplicantProfile);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({errors: [{msg : "Server error"}]});
    }
    }
  );

  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await JobApplicantProfile.findOne({ jobApplicant: req.jobApplicant.id });
      foundProfile.Education = foundProfile.Education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({errors: [{msg : "Server error"}]});
    }
  });
module.exports = router;