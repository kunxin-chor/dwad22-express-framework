const express = require('express');
const router = express.Router();

router.get('/', async(req,res)=>{
    res.send("All products");
})

router.get('/create', async(req,res)=>{
    res.send("Render a form to create a new product");
})

module.exports = router;