var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var UserModel = require('../models/user');



// ===========================================================
// Login user
// ===========================================================
app.post('/', (req, res) => {
    var body = req.body;

    UserModel.findOne({ email : body.email }, (err, user) => {

        if (err){
            return res.status(500).json({
                ok : false,
                mensaje: 'error finding user',
                errors: err
            });
        }
        if ( !user ) {
            return res.status(400).json({
                ok : false,
                mensaje: 'invalid user credentials - email' 
            });
        }
        if ( !bcrypt.compareSync( body.password , user.password) ) {
            return res.status(400).json({
                ok : false,
                mensaje: 'invalid user credentials - password'
            });
        }


        //Create token JWT
        user.password = ':)';
        var token = jwt.sign( { user: user }, SEED, { expiresIn: 14400} ); //4 hours

        res.status(201).json({
            ok: true,
            message : 'valid login post',
            user: user,
            id: user._id,
            token: token
        });
    });
    


    




});


module.exports = app;