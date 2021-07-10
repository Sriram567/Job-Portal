const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {


        await mongoose.connect(db,{
            useNewUrlParser : true,
            useUnifiedTopology: true,
            useCreateIndex : true,
            useFindAndModify: false
        })
        .then(()=>console.log("Database Connected"))
        .catch( (err) =>  console.log(` Error message ;- ${err.message}`) );
       

    } catch(err)
    {
        console.log("Database agfagadfgadfhgadhadhahaehtre Connected");
       // Exit the web application
        process.exit(1);
    }
}
module.exports = connectDB; 