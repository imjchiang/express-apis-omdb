require("dotenv").config();
const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const { default: Axios } = require("axios");
const app = express();
const { Sequelize } = require("sequelize");
const db = require("./models");

//using .env to hide API KEY
let API_KEY = process.env.API_KEY;

// Sets EJS as the view engine
app.set("view engine", "ejs");
// Specifies the location of the static assets folder
app.use(express.static("static"));
// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));
// Enables EJS Layouts middleware
app.use(ejsLayouts);

// Adds some logging to each request
app.use(require("morgan")("dev"));

// Routes
app.get('/', function(req, res) 
{
  res.render("index");
  
});

app.get("/results", function(req, res)
{
  let qs = 
  {
    params:
    {
      s: req.query.q,
      apikey: API_KEY
    }
  }
  
  Axios.get("http://www.omdbapi.com", qs)
  .then(function(response)
  {
    let movieData = response.data.Search;
    console.log(movieData);
  
    res.render("results", {movieData});
  })
  .catch(function(err)
  {
    console.log(err);
  });
});

app.get("/movies/:movie_id", function(req, res)
{
  console.log(req.params.movie_id);
  let qs = 
  {
    params:
    {
      i: req.params.movie_id,
      apikey: API_KEY
    }
  }

  Axios.get("http://www.omdbapi.com", qs)
  .then(function(response)
  {
    let movie = response.data;
    console.log(movie);

    res.render("detail", {movie});
  })
  .catch(function(err)
  {
    console.log(err);
  });
});

app.get("/faves", function(req, res)
{
  db.fave.findAll()
  .then(function(fave)
  {
    res.render("faves", {faves: fave});
  })
  .catch(function(err)
  {
    console.log(err);
  })
});

app.post("/faves", function(req, res)
{
  db.fave.findOrCreate(
  {
    where: 
    {
      title: req.body.title,
      imdbid: req.body.imdbid
    }
  })
  .then(function()
  {
    res.redirect("faves");
  })
});

// The app.listen function returns a server handle
var server = app.listen(process.env.PORT || 3000);

// We can export this server to other servers like this
module.exports = server;
