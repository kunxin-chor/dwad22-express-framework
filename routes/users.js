const express = require('express');
const { createUserForm, createLoginForm, bootstrapField } = require('../forms');
const { User } = require('../models');
const { checkIfAuthenticated} = require('../middlewares');
const router = express.Router();
const crypto = require('crypto');



const generateHashedPassword = (password) => {
    // hashing algo (sha256 is the name of algo)
    const sha256 = crypto.createHash('sha256');
    // generated the hashed password
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.get('/signup', function(req,res){
    const form = createUserForm();
    res.render('users/signup',{
        'form': form.toHTML(bootstrapField)
    });
})

router.post('/signup', function(req,res){
    const form = createUserForm();
    form.handle(req,{
        "success": async function(form) {
            // create a new user
            const user = new User();
            user.set("username", form.data.username);
            user.set("email", form.data.email);
            user.set("password", generateHashedPassword(form.data.password));
            await user.save();

            req.flash('success', 'Your account has been created! Welcome to Healthy Eating for Everyone!');
            res.redirect('/users/login');
        },
        "empty": async function(form) {
            res.render('users/signup',{
                'form': form.toHTML(bootstrapField)
            })
        },
        "error": async function(form) {
            res.render('users/signup', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
});

router.get('/login', function(req,res){
    const form = createLoginForm();
    res.render("users/login",{
        'form': form.toHTML(bootstrapField)
    });
})

router.post('/login', function(req,res){
    const form = createLoginForm();

    form.handle(req, {
        "success": async function(form) {
            // 1. get the user by email
            const user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false  // if the user is not found, Bookshelf won't throw error
            });

            console.log("user =>", user);

            if (!user) {
                res.status(403);
                req.flash('error', "Unable to authenticate your details");
                res.redirect('/users/login');
            } else {
                // 2. check if the password matches
                if (user.get('password') === generateHashedPassword(form.data.password)) {
                              
                // 3. if the user exists and the password matches, save the user id into the session
                //    (additionally, can save extra info) 
                    req.session.user = {
                        'id': user.get('id'),
                        'email': user.get('email'),
                        'username': user.get('username')
                    }
                    req.flash('success', `Welcome back ${user.get('username')}`);
                    res.redirect('/users/profile');

                }
            }

 
        },
        "empty": async function(form) {
            res.render('users/login',{
                form: form.toHTML(bootstrapField)
            })
        },
        "error": async function(form) {
            res.render('users/login',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
   
});

router.get('/profile', [checkIfAuthenticated], function(req,res){
   
        const user = req.session.user;
        res.render('users/profile',{
            'user': user
        });
  
 
})

router.get('/logout', function(req,res){
  
        req.session.user = null;
        req.flash('success', "Bye!");
        res.redirect('/users/login');
   

})

module.exports = router;