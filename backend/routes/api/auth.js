const express = require('express');
const router = express.Router();
const config = require('config');
const { check , validationResult} = require("express-validator/check");
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const Recruiter = require('../../models/Users/Recruiter');
const JobApplicant = require('../../models/Users/JobApplicant');
//@route  Get api/jobApplicant

router.get('/', auth,async (req, res) =>
{
    try{
        const jobApplicant = await JobApplicant.findById(req.jobApplicant.id);
        res.json(jobApplicant);

    }
    catch(error){
            console.error(error.message);
            res.status(500).json([{msg : "Server error"}]);
    }
});


// Login 

router.post('/',[
    check('email', 'Include a valid email').isEmail(),
    check('password',"Enter a valid Password").exists(),
  
  ], async (req, res) =>
  {
  
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
          return res.status(400).json({ERROR : errors.array()});
      }
      try{
  
          const {email, password  } = req.body;
          let jobApplicant = await JobApplicant.findOne({ email });
          if(!jobApplicant)
          {
              res.status(400).json({errors : [{msg : "Invalid credentials"}]});
          }
          else{
            
           
            if(jobApplicant.password !== password)
            {
               return res.status(400).json({errors : [{msg : "Invalid credentials"}]});
            }
              const payload =  {
                  jobApplicant :{
                      id : jobApplicant.id
                  }
              };  
              jwt.sign(payload ,
                  config.get('jwtToken'),
                  {expiresIn: 3600000 },
                  (err, token) => {
                      if(err) 
                      {
                          throw err;
                      }else{
                      res.json({token, select : "jobApplicant"});
                      }
                  }
                  ); 
  
          }
      
      }
      catch(err)
      {
          console.log(err);
      }
  });
module.exports = router;