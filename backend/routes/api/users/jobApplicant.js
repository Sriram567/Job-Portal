const express = require('express');
const router = express.Router();
const { check , validationResult} = require("express-validator");
const JobApplicant = require('../../../models/Users/JobApplicant');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken'); 
const config = require('config');

//@route  Get api/jobApplicant

router.post('/',[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Include a valid email').isEmail(),
  check('password',"Enter a valid Password").isLength({min: 6})
  //check('StarYear',"Mention your College Start Year").
  

], async (req, res) =>
{

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({errors : errors.array()});
    }
    try{
        const { name, email, password } = req.body;
        let jobApplicant = await JobApplicant.findOne({ email });
        if(jobApplicant)
        {
           return  res.status(400).json({errors : [{msg : "Applicant already exists"}]});
        }
        else{

                const avatar = gravatar.url(email,{
                    s:'200',
                    r: 'pg',
                    d: 'mm'
                });
                jobApplicant = new JobApplicant({

                name,
                email, 
                avatar,
                password 
            }); 


            await jobApplicant.save();

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
        res.status(500).json({errors : [{msg : "Server Error"}]});
    }
});
module.exports = router;