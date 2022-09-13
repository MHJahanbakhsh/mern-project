const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI');


const connectDB = async()=>{
    try{
        await mongoose.connect(db) //becuase mongoose.connect() returns a prommise
        console.log('MONGODB CONNECTED... ')
    }
    catch(err){
        console.error(err.message)
        
        //exit process
        process.exit()
    }
}    

module.exports = connectDB