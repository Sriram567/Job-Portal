const jwt = require("jsonwebtoken");
const config = require("config");

const func = (req,res ,next) => {

    const token = req.header('y-auth-token');

    if(!token)
    {
        return res.status(401).json({ msg : "Authorizatoin denied!!"});
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));

        req.recruiter = decoded.recruiter;

    } catch(err)
    {
        res.status(401).json({msg : "Token invald"});
    }
    next();
}
module.exports = func;