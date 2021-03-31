const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

// Register Handle
router.post('/register', (req, res) => {
    const { email, name, password, password2 } = req.body;
    let errors = [];

    // Check required fileds
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields.'})
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match.'})
    }

    // Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters.'})
    }

    if (errors.length > 0) {
        res.render('register', {
            errors, name, email
        })
    } else {
        // Validation passed
        User.findOne({ emai: email}).then( user => {
            if (user) {
                // User exists
                errors.push({ msg: 'Email already taken.'})

                res.render('register', {
                    errors, name, email
                })
            } else {
                // Hash Password
                const newUser = new User({
                    name, email, password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;

                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;

                        newUser.password = hash;

                        newUser.save().then(user => {
                            req.flash('success_msg', 'You are now registered and can login.');

                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err))
                    })
                })
            }
        }).catch(err => {
            console.log(err)
        });
    }
});

// Login Handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();

    req.flash('success_msg', 'You are logged out.');
    res.redirect('/users/login');
});

module.exports = router;