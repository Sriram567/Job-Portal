const jwt = require("jsonwebtoken");
const config = require("config");

const func = (req,res ,next) => {

    const token = req.header('x-auth-token');

    if(!token)
    {
        return res.status(401).json({ msg : "Authorizatoin denied!!"});
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));

        req.jobApplicant = decoded.jobApplicant;

    } catch(err)
    {
        res.status(401).json({msg : "Token invald"});
    }
    next();
}
module.exports = func;