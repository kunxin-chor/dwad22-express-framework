const jwt = require('jsonwebtoken');

const checkIfAuthenticated = (req,res,next) => {
    if (req.session.user) {
        next();
    } else {
        req.flash('error', "You need to sign in to access the page");
        res.redirect("/users/login");
    }
}

const checkIfAuthenticatedWithJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.TOKEN_SECRET, function(err,user){
            if (err) {
                res.sendStatus(403);
            } else {
                // save the current user in the session
                req.user = user;
                next();
            }
        })
    } else {
        res.sendStatus(401);
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedWithJWT}