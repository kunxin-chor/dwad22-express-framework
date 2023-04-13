const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
})

// when we get a signature, the request will be in query string
// this route will be called by the cloudinary widget
router.get('/sign', function(req,res){
    const paramsToSign = req.query.params_to_sign;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // generate the signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    res.send(signature);
})

module.exports = router;