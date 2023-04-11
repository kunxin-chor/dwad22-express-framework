const checkIfAuthenticated = (req,res,next) => {
    if (req.session.user) {
        next();
    } else {
        req.flash('error', "You need to sign in to access the page");
        res.redirect("/users/login");
    }
}

module.exports = { checkIfAuthenticated}