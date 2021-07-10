const express = require('express');
const router = express.Router();
const config = require('config');
const { check , validationResult} = require("express-validator/check");
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const auth2 = require('../../middleware/auth2');
const Recruiter = require('../../models/Users/Recruiter');
const JobApplicant = require('../../models/Users/JobApplicant');
//@route  Get api/recruiter

router.get('/', auth2,async (req, res) =>
{
    try{
        const recruiter = await Recruiter.findById(req.recruiter.id);
        res.json(recruiter);
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
      console.log("asdfasdfasdf");
  
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
          return res.status(400).json({error : errors.array()});
      }
      try{
  
          const {email, password  } = req.body;
          let recruiter = await Recruiter.findOne({ email });
          if(!recruiter)
          {
              res.status(400).json({errors : [{msg : "Invalid credentials"}]});
          }
          else{
            
            console.log(password);
            if(recruiter.password !== password)
            {
               return res.status(400).json({errors : [{msg : "Invalid credentials"}]});
            }
              const payload =  {
                  recruiter :{
                      id : recruiter.id
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
                      res.json({token, select : "recruiter"});
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