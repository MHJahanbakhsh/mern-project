const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/users')

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

module.exports = router;