const express = require('express')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const {check,validationResult} = require('express-validator');
const User = require('../../models/users')
const jwt = require('jsonwebtoken')
const config = require('config')

// @route   POST api/users
// @desc    Register user
// @access  Public
const router = express.Router();
router.post('/',[
    check('name','name is required').not().isEmpty(),
    check('email','Email is not valid').isEmail(),
    check('password','please enter a password with 6 or more charcters').isLength({min:6})
],async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {name,email,password} = req.body

    try{
        //see if user exists(if yea,send back error)
        let user = await User.findOne({email})
        if(user){
           return res.status(400).json({errors:[{msg:'User Already Exists'}]})
        }

        //if not,carry on to create that user:
        //Get users Gravatar
        const avatar = gravatar.url(email,{
            s:'200',
            d:'mm'
        })
        //create a new user when user does not already exists.(here we just create an instance.it is not saved to database yet)
        user = new User({
            name,email,avatar,password
        })

        //encrypt password before saving to database
        const salt = await bcrypt.genSalt(10) //10 is recomended in docs.strong but computation is also fast  
        user.password = await bcrypt.hash(password,salt)

        //save user to db
        await user.save()


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