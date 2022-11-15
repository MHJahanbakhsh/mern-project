const jwt = require('jsonwebtoken')
const config = require('config')


module.exports = function(req,res,next){ //since it is a middleware function, it has this function structure
    //Get token from header(typically when we send a request from frontend, we provide it's header with token to access protected routes)
    const token = req.header('x-auth-token') //this 'x-auth-token' is a name that we choose for our token.it's nothing special to express or node

    //Check if there is not a token
    if(!token){
        return res.status(401).json({msg:'no token, authorization denied'})
    }

    //verify token(if there is one)
    try{
        //decodes token's payload
        const decoded = jwt.verify(token,config.get()) //this lead to error if verifies failed? so that catch statement catches the error?
        
        //our payload in here is an object with a user property
        //why we set that to the request object user property?to use that info in our protected routes. for ex: get users profile
        req.user = decoded.user //we manually add this to req so next middlewares use it
        next()
    }catch(err){
        res.status(401).json({msg:'token is not valid'})
    }
}