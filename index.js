const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const flash = require('connect-flash');
const csrf = require('csurf');

// FileStore for storing the session
const FileStore = require('session-file-store')(session);

require("dotenv").config();

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
// middlewares allow us to modify the request and/or response
// before the routes are called
app.use(
  express.urlencoded({
    extended: false
  })
);


// setup sessions
app.use(session({
  'store': new FileStore(),
  'secret': process.env.SESSION_SECRET,
  'resave': false,
  'saveUninitialized': true
}))

// setup flash messaging
// because the flash messaging needs session
// we have setup after sessions
app.use(flash());

// enable csrf (after enabling sessions)
// EVERY POST ROUTE (every app.post or router.post) will be protected by CSRF
// app.use(csrf());

// use our own proxy mdidleware to enable csrf selectively
// (i.e so that we can exclude certain routes from csrf)
const csrfInstance = csrf();
app.use(function (req, res, next) {
  if (req.url == "/checkout/process_payment" || req.url.slice(0,5) === "/api/") {
    // to exempt the route from CSRF
    next();
  } else {
    // enable csrf for requests that does not access the payment
    csrfInstance(req, res, next);
  }

})

// this middleware is to handle invalid csrf tokens errors
// make sure to put this immediately after the app.use(csrf())
app.use(function (err, req, res, next) {
  // the error parameter is to handle errors
  if (err && err.code === "EBADCSRFTOKEN") {
    req.flash('error', "The form has expired. Please try again");
    res.redirect('back'); // go back in history one step
  } else {
    next();
  }
});

// demo allowing all hbs files to access the date
app.use(function (req, res, next) {

  // all the variables that are available in hbs files are in res.locals
  res.locals.date = new Date();

  // next will refer either the next middleware or the route itself
  next();
})

// use our own custom middleware to extract flash messages
app.use(function (req, res, next) {
  res.locals.successes = req.flash('success');
  res.locals.errors = req.flash('error')
  next();
});

// share the csrf token with all hbs files
app.use(function (req, res, next) {
  // when we do app.use(csrf()), it adds the csrfToken function to req
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }

  next();
})



// import in the router
// if we want to require our own files, we have to begin with "./"
const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products.js');
const userRoutes = require('./routes/users.js');
const cloudinaryRoutes = require('./routes/cloudinary.js');
const cartRoutes = require('./routes/cart.js');
const checkoutRoutes = require('./routes/checkout.js');


const api = {
  products: require('./routes/api/products.js'),
  users: require('./routes/api/users.js')
}

async function main() {
  // make use of the landing page routes
  // if the url begins with "/", using the landingRoutes router
  app.use('/', landingRoutes);

  // If the URL begins with /products, then use productRoutes
  app.use('/products', productRoutes)

  // If the URL begins with /users, then use the userRoutes
  app.use('/users', userRoutes);

  app.use('/cloudinary', cloudinaryRoutes);

  app.use('/cart', cartRoutes);

  app.use('/checkout', checkoutRoutes);

  // API routes
  app.use('/api/products', express.json(), api.products);
  app.use('/api/users', express.json(), api.users);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});