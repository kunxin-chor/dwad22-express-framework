// this router file will contain the routes for
// the landing page, the about us and the contact us
const express = require('express');

// create a router object
const router = express.Router();

// a router object can contain routes
router.get("", (req,res)=>{
    res.render("landing/welcome");
})

router.get('/about-us', (req,res)=>{
    res.send("About Us");
})

router.get('/contact-us', (req,res)=>{
    res.send("Contact Us");
})

// we export out the router so that other files, such as index.js, can use it
module.exports = router;