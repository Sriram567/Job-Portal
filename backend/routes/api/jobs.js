const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator/check');
const auth2 = require('../../middleware/auth2');
const auth = require('../../middleware/auth');

const Job = require('../../models/Jobs');
const Recruiter = require('../../models/Users/Recruiter');
const RecruiterProfile = require('../../models/Profiles/RecruiterProfile');
const JobApplicantProfile = require('../../models/Profiles/JobApplicantProfile');
const Application = require('../../models/Application');
const JobApplicant = require('../../models/Users/JobApplicant');
//@route  Get api/recruiter
router.get('/applciantApp/:id', auth2, async (req, res)=> 
{
    try {
        const jobApplicant =await JobApplicant.findById(req.params.id); 
        res.json(jobApplicant);

    } catch (error) {
        console.error(error.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});
router.get('/myapplications', auth, async (req, res) => {
    try {
        const applications = await Application.find({jobApplicant : req.jobApplicant.id})
        .populate('recruiter',['name', 'email'])
        .populate('job',['Title', 'Salary']);

        
        res.json(applications);

    } catch (error) {
        console.log("HIMBI INBI"); 
        console.error(error.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});
router.get('/getAcceptedApplications', auth2, async (req, res) => {
    try {
        const applications = await Application.find({recruiter : req.recruiter.id, ApplicationStatus : 2});
        
        res.json(applications);

    } catch (error) {
        console.log("HIMBI INBI"); 
        console.error(error.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});
router.post('/application/rating', async(req, res) => {
    try {
        const {select, rating, id} = req.body;
        let newApplication;
        if(select === 1)
        {
            newApplication = {
                jobRating : rating
            }
    }
        else if(select === 0){
            newApplication = {
            jobApplicantRating : rating
        }
        }
        const application = await Application.findOneAndUpdate(
            {_id : id},
            { $set : newApplication},
            {new : true}
        );
        if(select === 0)
        {
            const applications = await Application.find({jobApplicant: application.jobApplicant});
            if(applications.length > 0)
            {

                let i= 0;
                let tr = 0;
                applications.forEach(element => {
                    tr = tr + element.jobApplicantRating;
                });
                const Rating  = (tr/(applications.length));
                const newProfile = {
                    Rating : Rating
                }
                await JobApplicantProfile.findOneAndUpdate(
                    {jobApplicant : application.jobApplicant},
                    { $set : newProfile},
                    {new : true}
                );
            }
        }
        else{
            const applications = await Application.find({job: application.job});

            if(applications.length > 0)
            {
                console.log(`lenfth is ${applications.length}`);
                let i= 1;
                let tr = 0;
                applications.forEach(element => {
                    tr = tr + element.jobRating;
                });
                const Rating  = (tr/(applications.length));
                console.log(`Rating is ${Rating}`);
                const newProfile = {
                    Rating : Rating
                }
                const job = await Job.findOneAndUpdate(
                    {_id : application.job},
                    { $set : newProfile},
                    {new : true}
                );
                console.log(`The job is rated and the rating is ${job.Rating}`);            
            }
            
        }
        
       // console.log(`appication is ${application}`);
       console.log("after is correctt")
        res.json(application);

    } catch (error) {
        console.error(error.message);
        return  res.status(400).json({errors : [{msg : "Server Error!!"}]});
    }
});
router.post('/edit/:id', auth2,async (req, res) => {
    try {
        const {
            NoApplicants,
            NoPositions,
            DeadLine
        } = req.body;
        const newJob  = {};
        if(NoApplicants)
        {
            newJob.NoApplicants = NoApplicants;
        }
        if(NoPositions)
        {
            newJob.NoPositions = NoPositions;
        }
        if(DeadLine)
        {
            newJob.DeadLine = DeadLine;
        }
       
       await Job.findOneAndUpdate(
            {_id : req.params.id},
            { $set : newJob},
            {new : true}
            );
            const jobs = await Job.find().sort({DateOfPosting : -1});const rjobs = await Promise.all(jobs.map(async (job, index) => { 
                const applicationsforjob = await Application.find({job : job._id });
                if(job.NoApplicants == 0 || job.NoPositions === 0)
                {
                    job.Status = "full";
                        job.numapplied = job.NoApplicants
                        return job;
                }
                if(applicationsforjob.length > 0)
                {
                    if(applicationsforjob.length >= job.NoApplicants)
                    {
                        job.Status = "full";
                        job.numapplied = job.NoApplicants
                        return job;
                    
                    }
                    else
                    {
                        job.numapplied = applicationsforjob.length;
    
                        return job;
                    }
                    
                }
                else
                {
                    job.numapplied = applicationsforjob.length;
    
                    return job;
                }
            }));
            res.json(rjobs);        
    


            
    } catch (error) {
        console.log(error)
        res.status(500).json({errors :[{msg : "Server Error"}]});

    }
});
router.get('/byApplication/:id',auth2, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if(!job)
        {
            console.log("No job");
            return res.status(400).json({errors : [{msg : "No job"}]});
        }
      //  console.log(job);
        res.json(job);
    } catch (error) {
        console.error(` Id is -- Erroris ${error.message}`);
        res.status(500).json({errors :[{msg : "Server Error"}]});
    }
})
router.post('/', [auth2, [
    check('Title', 'Give a title').not().isEmpty(),
    check('RequiredSkillSet', 'Skills are required').not().isEmpty(),
   // check("DeadLine", "DeadLine has to be given").not().isEmpty(),
    check("TypeOfJob", "TypeOfJob has to be given").not().isEmpty(),
    check("Salary", "Salary has to be given").not().isEmpty(),
    check("Duration", "Duration has to be given").not().isEmpty(),

]], async (req, res) =>
{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        console.log(errors.array());
        return res.status(400).json({errors : errors.array()});
    }
    else
    {
        try
        {
            const recruiter = await Recruiter.findById(req.recruiter.id);
            const {
                Title,
                NoApplicants,
                NoPositions,
                RequiredSkillSet,
                DeadLine,
                Duration,
                Salary,
                TypeOfJob
            } = req.body;
            let SkillSet = [];
            if(RequiredSkillSet)
            {
                SkillSet = Array.isArray(RequiredSkillSet)
                ? RequiredSkillSet
                : RequiredSkillSet.split(',').map((skill) => ' ' + skill.trim());
            }
            
            const newJob = new Job({
                recruiter :req.recruiter.id,
                email : recruiter.email,
                Title,
                NoApplicants,
                DeadLine,
                NoPositions,
                RequiredSkillSet : SkillSet,
                Duration,
                Salary,
                TypeOfJob
            });

            const job =await newJob.save();
            res.json(job);

        }
        catch(error)
        {
            console.error(` Error is ${error.message}`);
            res.status(500).json({errors :[{msg : "Server Error"}]});
        }
    
    }

});
router.post('/application/changeStatus', auth2, async (req, res) => {
    try {
        const {
            ApplicationStatus,
            jobApplicant,
            job
        } = req.body
        let newApplication;
        if(ApplicationStatus === 2){
            newApplication = {
                ApplicationStatus : ApplicationStatus,
                DateofJoining: new Date()
            }
        }else{
            newApplication = {
                ApplicationStatus : ApplicationStatus
            }
        }
        
            if(ApplicationStatus === 2)
            {
        const pjob = await Job.findById(job);
        const nop = pjob.NoPositions - 1;
        const newJob = {
            NoPositions : nop
            };
        await Job.findOneAndUpdate(
            {_id : job },
            { $set : newJob},
            {new : true}
            );
            const newApplicatio = {
                ApplicationStatus : 3
            }
            await Application.updateMany(
                {jobApplicant :  jobApplicant},
                { $set : newApplicatio},
                {new : true}
            );

            }
            const sd  = await Application.findOneAndUpdate(
                {job : job , jobApplicant : jobApplicant},
                { $set : newApplication},
                {new : true}
                );
            res.json(sd);
    } catch (error) {
        console.error(`Application Error is ${error.message}`);
        res.status(500).json({errors :[{msg : "Server Error"}]});
    }
});
router.get('/',auth,async (req,res) =>
{
    try {
        let jobs = await Job.find().sort({DateOfPosting : -1}).populate('recruiter',['name']);
        let japplications = await Application.find({jobApplicant : req.jobApplicant.id, ApplicationStatus : 2 });
        if(japplications.length > 0)
        {
            const newjp = {Status : true}
            await JobApplicantProfile.findOneAndUpdate(
                {jobApplicant : req.jobApplicant.id},
                { $set : newjp},
                {new : true}
            );
        }else{
            const newjp = {Status : false}
            await JobApplicantProfile.findOneAndUpdate(
                {jobApplicant : req.jobApplicant.id},
                { $set : newjp},
                {new : true}
            );
        }

        let rjobs = await Promise.all(jobs.map( async (job, index) => {
            
            const applicationsforjob = await Application.find({job : job._id });
            if(job.NoApplicants == 0 || job.NoPositions === 0)
            {
                job.Status = "full";

                return job
            }
            console.log(`application for job are ${applicationsforjob.length}`);
            if(applicationsforjob.length > 0)
            {
                if(applicationsforjob.length >= job.NoApplicants)
                {
                    job.Status = "full";
                    job.numapplied = job.NoApplicants
                    return job;
                
                }
                else
                {
                    job.numapplied = applicationsforjob.length;
                    const job_apply = await Application.find({job: job._id, jobApplicant: req.jobApplicant.id});
                    if(job_apply.length > 0)
                    {
                        job.applicantstatus = "Applied";
                    } 
                    else
                    {
                        job.applicantstatus = "Apply";
                    }

                    return job;
                }
                
            }
            else
            {
                job.numapplied = applicationsforjob.length;
                const job_apply = await Application.find({job: job._id, jobApplicant: req.jobApplicant.id});
                if(job_apply.length > 0)
                {
                    job.applicantstatus = "Applied";
                } 
                else
                {
                    job.applicantstatus = "Apply";
                }
                return job;
            }
        }));
        res.json(rjobs);
    } catch (error) {
        console.log("Error is");
        console.log(error.message);
        res.status(400).json({errors :[{msg : "Error"}]});
    }
});

router.get('/job/:id', auth, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      if (!job) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      res.json(job);
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
  });

router.get('/:id',auth2,async(req,res) =>
{
    try {
        const jobs = await Job.find({ recruiter : req.recruiter.id});
        /*if(!jobs){
            res.status(400).json({errors :[{msg : "Post not found!!"}]});
        }*/
        const rjobs = await Promise.all(jobs.map(async (job, index) => { 
            const applicationsforjob = await Application.find({job : job._id });
            if(job.NoApplicants == 0 || job.NoPositions === 0)
            {
                job.Status = "full";
                    job.numapplied = job.NoApplicants
                    return job;
            }
            if(applicationsforjob.length > 0)
            {
                if(applicationsforjob.length >= job.NoApplicants)
                {
                    job.Status = "full";
                    job.numapplied = job.NoApplicants
                    return job;
                
                }
                else
                {
                    job.numapplied = applicationsforjob.length;

                    return job;
                }
                
            }
            else
            {
                job.numapplied = applicationsforjob.length;

                return job;
            }
        }));
        res.json(rjobs);        
    } catch (error) {
        console.log(error.message);

        if(error.kind === 'ObjectId')
        {
           return  res.status(400).json({errors :[{msg : "Post not found!!"}]});
        }
        res.status(400).json({errors :[{msg : "Error"}]});
    }
});


router.delete('/:id',auth2,async(req,res) =>
{
    try {
        const job = await Job.findById(req.params.id);
        
        if(!job){
            console.log("Post not found!!");
           return res.status(400).json({errors :[{msg : "Post not found!!"}]});
        }
        // check recruiter
        if(job.recruiter.toString() !== req.recruiter.id )
        {
            console.log("Post not found!asa!");

            return res.status(401).json({errors :[{msg : "Recruiter is not authorized!!"}]});
        }
        await Application.deleteMany({job : job._id});
        await job.remove();
        
      //  res.status(400).json({errors :[{msg : "Job removed!!"}]});
        res.json(job);
    } catch (error) {
        if(error.kind === 'ObjectId')
        {
            console.log("Post not found!!");

           return res.status(400).json({errors :[{msg : "Post not found!!"}]});
        }
        console.log(error.message);
        res.status(400).json({errors :[{msg : "Error"}]});
    }
});

router.post('/apply/:id', [auth,[
    check('SOP', 'Provide SOP').not().isEmpty()
]], async (req, res) =>
{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {   console.log(errors.array());
        return res.status(400).json({errors : errors.array()});
    }
    else
    {
        try
        {            
            const { 
                SOP
            } = req.body;
            const Jobby = await Job.findById(req.params.id); 
            const abc = await Application.find({job: req.params.id , jobApplicant: req.jobApplicant.id });
            console.log(`abc is ${abc.length}`);
            if(abc.length)
            {   console.log("Already applied!");
                return res.status(400).json({errors : [{msg: "Already applied!!"}]});
            }
            const newApplication = new Application({
                recruiter : Jobby.recruiter,
                jobApplicant : req.jobApplicant.id,
                job : req.params.id,
                
                SOP
            });
            const app = await Application.find({jobApplicant: req.jobApplicant.id});
            if(app.length >= 10)
            {
                return res.status(404).json({errors : [{msg: "Capacity"}]});
            }
            
            await newApplication.save();
           
            const applications = await Application.find({job : req.params.id });
            res.json(applications);

        }
        catch(error)
        {
            console.error(error.message);
            res.status(500).json({errors :[{msg : "Server Error"}]});
        }
    
    }
});
router.get('/job/applied/:id',auth2, async(req, res) =>
{
    try {
        const applicants = await Application.find({job: req.params.id});
        res.json(applicants);
    } catch (error) {
        console.log("IS ERROR:::")
        console.error(error.message);
            res.status(500).json({errors :[{msg : "Server Error"}]});
    } 
})

module.exports = router;
