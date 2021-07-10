const express  = require('express');
const connectDB =  require('./config/db');

const app = express()
// Connectiong to database
connectDB();
app.use(express.json({ extended: false}));

app.get('/', (req , res) => {
    res.send('Running');
    console.log("running"); 

});

// @routes
app.use('/api/auth2', require("./routes/api/auth2"));
app.use('/api/auth', require("./routes/api/auth"));
app.use('/api/jobs', require("./routes/api/jobs"));

app.use('/api/users/jobApplicant', require("./routes/api/users/jobApplicant"));
app.use('/api/users/recruiter', require("./routes/api/users/recruiter"));

app.use('/api/profiles/jobApplicant', require("./routes/api/profiles/jobApplicantProfile"));
app.use('/api/profiles/recruiter', require("./routes/api/profiles/recruiterProfile"));




const PORT  = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Sever connected '))