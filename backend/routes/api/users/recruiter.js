const express = require('express');
const router = express.Router();
const { check , validationResult} = require('express-validator');
const Recruiter = require('../../../models/Users/Recruiter');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken'); 
const config = require('config');
//@route  Get api/recruiter

router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Include a valid email').isEmail(),
    check('password',"Enter a valid Password").isLength({min: 6})
    ], async (req, res) =>
    {

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
        }
        try{
            const { name, email, password } = req.body;
            let recruiter = await Recruiter.findOne({ email });
            if(recruiter)
            {
                res.status(400).json({errors : [{msg : "Applicant already exists"}]});
            }
            else{
    
                    const avatar = gravatar.url(email,{
                        s:'200',
                        r: 'pg',
                        d: 'mm'
                    });
    
                    recruiter = new Recruiter({
    
                    name,
                    email, 
                    avatar,
                    password
                }); 
    
    
                await recruiter.save();
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