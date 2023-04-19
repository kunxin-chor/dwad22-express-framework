const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User, BlacklistedToken} = require('../../models');
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');

// the user argument is bookshelf model
// const generateAccessToken = (user) => {
//     // create a new JWT 
//     // first argument is the payload (the object that we store in the JWT)
//     return jwt.sign({
//         "username": user.get('username'),
//         "id": user.get('id'),
//         "email": user.get("email")
//     }, process.env.TOKEN_SECRET,{
//         "expiresIn": "1h" // m = minutes, w = weeks, h = hours, s = seconds, d = days
//     })
// }

// generic generate token function for both access token and refresh token
const generateToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, secret,{
        expiresIn
    })
}

const getHashedPassword = (data) => {
    const sha256 = crypto.createHash("sha256");
    const hash = sha256.update(data).digest("base64");
    return hash;
}

router.post('/login', async (req,res)=>{
    // fetch the user
    const user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    if (user && user.get('password') === getHashedPassword(req.body.password)) {
        // generate the JWT
        const accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "10m");
        const refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, '3w');
        res.json({
            accessToken, refreshToken
        })
    } else {
        res.status(403);
        res.json({
            'message':'Invalid credentials'
        })
    }
})

router.post('/refresh', async (req,res)=>{
    // we assume the refresh token is to be in the body
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function(err,user){
            if (err) {
                res.status(401);
                res.json({
                    'message':"No refresh token found"
                })
            } else {

                // check if the refresh token has been blacklisted
                const blacklistedToken = BlacklistedToken.where({
                    'token': refreshToken
                }).fetch({
                    require:false
                })

                if (blacklistedToken) {
                    res.status(403);
                    res.json({
                        'message':"The refresh token has been blacklisted"
                    });
                    
                } else {
                    const accessToken = generateToken(user, process.env.TOKEN_SECRET, "10m");
                    res.json({
                        accessToken
                    });
                }

               
            }
        })
    }
})

router.post('/logout', async(req,res)=>{
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401)
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err,user)=>{
            if (err) {
                res.sendStatus(401)
            } else {
                const blacklistedToken = new BlacklistedToken();
                blacklistedToken.set('token', refreshToken);
                blacklistedToken.save();
                res.json({
                    'message':'Logged Out'
                })
            }
        })
    }
})

router.get('/profile', [checkIfAuthenticatedWithJWT], function(req,res){
    res.json({
        'user': req.user
    })
})

module.exports = router;