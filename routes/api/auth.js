const express = require('express')
const auth = require('../../middleware/auth')
const User = require('../../models/users')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const {check,validationResult} = require('express-validator');



const router = express.Router();
// @route   GET api/auth
// @desc    Test route
// @access  Public
//buy just adding this auth middleware,it makes this route protected(it only proceeds to next() when we provide a correct jwt token. see the codes )
router.get('/',auth,async (req,res)=>{
    try{
        //we added "user" to req in auth middleware
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    }catch(err){
        console.error(err.message)
        res.status(500).send('server Error')
    }
})


//as u can see we have diffrent http methods within a same route
// in the rout below we try to authenticate user for first entrance(login)

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/',[
    check('email','Email is not valid').isEmail(),
    check('password','you must enter a password').exists()
],async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,password} = req.body

    try{
        //see if user does not exists.so it can't log in
        let user = await User.findOne({email})
        if(!user){
           return res.status(400).json({errors:[{msg:'Invalid Credentials'}]})
        }

        

        //now the email is existed, let see if the provided password is correct
        const flag =  await bcrypt.compare(password,user.password)
        if(!flag){
            return res.status(400).json({errors:[{msg:'invalid credentials'}]})
        }



        //Return jsonwebtoken
        const payload = {
            user:{
                id:user.id //as u recall, mongodb creates a _id for each record.but with mongoose we can access that via .id instead of ._id
            }
        }
        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:360000},(err,token)=>{
            if(err)throw err;
            res.json({token})
        })

    }catch(err){
        console.error(err.message)
        res.status(500).send(' Server Error')
    }
})
module.exports = router;