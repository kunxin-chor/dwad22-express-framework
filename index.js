const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
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
app.use(
  express.urlencoded({
    extended: false
  })
);

// import in the router
// if we want to require our own files, we have to begin with "./"
const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products.js');
async function main() {
  // make use of the landing page routes
  // if the url begins with "/", using the landingRoutes router
  app.use('/', landingRoutes);

  // If the URL begins with /products, then use productRoutes
  app.use('/products', productRoutes)
  
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});