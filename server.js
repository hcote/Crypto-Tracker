// require express and other modules
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  validate = require('express-validator')
  //  NEW ADDITIONS
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  axios = require('axios');



// require Post model
var db = require("./models"),
  User = db.User,
  Coin = db.Coin;
// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true, }));

// serve static files from public folder
app.use(express.static(__dirname + "/public"));

// set view engine to ejs
app.set("view engine", "ejs");

app.use(methodOverride("_method"));

app.use(cookieParser());
app.use(session({
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(validate());

// Login system wont work without these
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CHECK
app.get('/', function(req, res) {
    Coin.remove({}, function(err, succ){
    console.log(succ);
  });
    axios.get('https://api.coinmarketcap.com/v1/ticker/')
         .then(function(response) {
           // console.log(`Response: ${response.status}`);
           Coin.create(response.data, function(err, coinsCreated) {
             if (err) {
               console.log(err);
             } else {
                  // console.log(`Coins: ${coinsCreated}`);
             }
           })
         })
         .catch(function(err) {
           console.log(err);
        })
          console.log(req.user);
          Coin.find(function(err, allCoins) {
            if (err) {
              console.log(err);
            } else {
                res.render('index', {user: req.user, coins: allCoins})
            }

        })
      })

// CHECK
app.get("/portfolio/:id", function (req, res) {
  var userId = req.params.id;
  User.findById(userId, function(err, succ) {
    if (err) {
      console.log(err);
    } else {
      User.find({})
      .populate('User.portfolio')
      .exec(function(err, port) {
          res.render("portfolio", {user: succ, portfolio: port});
      })
    }
  })
});

// Portfolio if not signed in
// app.get("/portfolio/", function (req, res) {
//   var userId = req.user
//   User.findById(userId, function(err, succ) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render("portfolio", {user: succ});
//     }
//   })
// });

app.get("/favorites", function (req, res) {
          var user = req.user
          if (req.user == undefined) {
            console.log(`Req.user = ${req.user}`);
            User.find(function(err, userFound) {
              if (err) {
                console.log(err);
              } else {
                res.render("favorites", {user: user, id: id});
              }
            })
          } else {
            var id = req.user._id
            console.log(`Req.user = ${req.user}`);
            User.find(function(err, userFound) {
              if (err) {
                console.log(err);
              } else {
                res.render("favorites", {user: user, id: id});
              }
            })
          }
      });

      app.get("/forums", function (req, res) {
            var user = req.user
            if (req.user == undefined) {
              console.log(`Req.user = ${req.user}`);
              User.find(function(err, userFound) {
                if (err) {
                  console.log(err);
                } else {
                  res.render("forums", {user: user, id: id});
                }
              })
            } else {
              var id = req.user._id
              console.log(`Req.user = ${req.user}`);
              User.find(function(err, userFound) {
                if (err) {
                  console.log(err);
                } else {
                  res.render("forums", {user: user, id: id});
                }
              })
            }
        });

app.get("/news", function (req, res) {
   console.log(req.user);
   User.find(function(err, users) {
     if (err) {
       console.log(err);
     } else {
       res.render("news", {user: users});
     }
   })
  });

// Render signup page
app.get("/signup", function (req, res) {
    res.render("signup");
  });

// Render login page
app.get("/login", function (req, res) {
  res.render("login");
});

// CHECK
app.get('/all', function(req, res) {
  User.find(function(err, allUsers) {
    if (err) {
      console.log("Error getting all Users: " +  err);
    } else {
      Coin.find(function(err, allCoins) {
        if (err) {
          console.log(err);
        } else {
          res.json({users: allUsers, coins: allCoins})
        }
      })

    }
  })
})

// CHECK
app.post("/signup", function (req, res) {
  console.log(req.body);
  User.register(new User({ username: req.body.username,
                           password: req.body.password,
                           name: req.body.name,
                           isLocal: req.body.isLocal,
                           age: req.body.age,
                           city: req.body.city,
                           bio: req.body.bio}), req.body.password,
      function () {
        passport.authenticate("local")(req, res, function() {
          // If a traveler signs up, redirect to the feed
          if (req.body.isLocal === 'Traveler') {
          res.redirect('/feed');
        } else {
          // If a local signs up, redirect to their profile
          res.redirect(`/user/${req.user._id}`);
        }
      })
    }
  )
});

app.post('/all/coins', function(req, res) {

})

// CRUD Routes - all functional

// SHOW (user profile) - working
app.get('/user/:id', function(req, res) {
  console.log(userId);
  console.log(req.user);
  var Id = req.user._id;
  var userId = req.params.id;
  User.findById(userId, function(err, succ) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log(userId + " " + succ._id);
      res.render('profile', {user: succ, req: userId, id: Id})
    }})
  })

  // Coin show page
  app.get('/:symbol', function(req, res) {
    var coinId = req.params.symbol;
    Coin.find({symbol: coinId}, function(err, succ) {
      if (err) {
        console.log(err);
      } else {
        User.find(function(err, users) {
          if (err) {
            console.log(err);
          } else {
            console.log(succ);
            res.render('coin_show', {coin: succ, user: users})
          }
        })
      }
    })
  })

// UPDATE PAGE FOR USER PROFILE
app.get('/user/:id/update', function(req, res) {
  var Id = req.user._id;
  var userId = req.params.id;
  console.log(userId);
  User.findById(userId, function(err, succ) {
    if (err) {
      console.log("Error: " + err);
    } else {
      res.render('update_profile', {user: succ, req: userId, id: Id})
    }})
})

app.post('/addCoin', function(req, res) {
  var userId = req.user._id
  User.findById(userId, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      Coin.find({symbol: req.body.symbol}, function(err, foundCoin) {
        // console.log(`foundCoin: ${foundCoin}`);
        console.log(`foundCoin: ${foundCoin[0].name}` );
        console.log(`req.body.symbol: ${req.body.symbol}`);
        var newCoin = new Coin ({
          symbol: foundCoin[0].symbol,
          name: foundCoin[0].name,
          price_usd: foundCoin[0].price_usd,
          price_btc: foundCoin[0].price_btc,
          qty: req.body.qty
        })
        console.log(`newCoin: ${newCoin}`);
        newCoin.save(function(err, saved) {
          if (err) {
            (`Error saving: ${err}`)
          } else {
            console.log(`foundUser: ${foundUser}`);
            foundUser.portfolio.push(newCoin._id);
            res.redirect('/')
          }
        })
      })
    }
  })
})

// SAVE UPDATES FOR USER PROFILE
app.put('/user/:id', function(req, res) {
  console.log("Hello, you just tried to update");
  var Id = req.user._id;
  var userId = req.params.id;
  User.findById(userId, function(err, foundUser) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("found user " + foundUser);
      foundUser.username = req.body.username,
      foundUser.name = req.body.name,
      foundUser.isLocal = req.body.isLocal,
      foundUser.age = req.body.age,
      foundUser.city = req.body.city,
      foundUser.bio = req.body.bio;
      foundUser.save(function(err, updatedUserSaved) {
        if (err) {
          console.log(err);
        } else {
          console.log('User is Saved: ' + updatedUserSaved);
          res.render('profile', {user: updatedUserSaved, req: userId, id: Id})
        }
      })
    }})
  })

// DELETE
app.delete('/user/:id', function(req, res) {
  console.log(req);
  User.findByIdAndRemove(req.params.id, function(err, deletedUser) {
    if (err) {
      console.log("Error trying to delete profile: " + err);
    } else {
    console.log("User Deleted Sucessfully");
    res.redirect('/');
  }
  })
})

// LOGIN login
app.post("/login", passport.authenticate("local"), function (req, res) {
  console.log(req);
  User.findOne({username: req.body.username}, function(err, succ){
    console.log("Error is: " + err);
    console.log("Success is: " + succ);
    if(req.body.password === succ.password) {
      res.redirect(`/user/${req.user._id}`);
    }
    else{
      console.log(err);
      res.sendStatus(404);
    }
  })
})

// Logout does not work yet
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// listen on port 3000
app.listen(process.env.PORT || 3000, function() {
  console.log("server started");
});
