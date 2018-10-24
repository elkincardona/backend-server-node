var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var CLIENT_IDD = require('../config/config').CLIENT_ID;

// google oauth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_IDD);



var app = express();

var UserModel = require('../models/user');



// ===========================================================
// Login with google
// ===========================================================

async function verify(TOKEN) {
    const ticket = await client.verifyIdToken({
        idToken: TOKEN,
        audience: CLIENT_IDD,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }



app.post('/google', async (req, res) => {

    var token = req.body.token;
    
    var googleUser = await verify(token).catch( e => {
        return res.status(401).json({
            ok: false,
            message: 'invalid token'
        });
    });

    UserModel.findOne({ email: googleUser.email}, (err, userdb) => {

        if (err){
            return res.status(500).json({
                ok : false,
                mensaje: 'error finding user',
                errors: err
            });
        }

        if ( userdb ){
            if ( userdb.google === false) {
                return res.status(400).json({
                    ok : false,
                    mensaje: 'must authenticate with the normal account',
                });
            }
            else {
                var token = jwt.sign( { user: userdb }, SEED, { expiresIn: 14400} ); //4 hours
                //userdb.password = ":)";
                res.status(200).json({
                    ok: true,
                    message : 'valid login post',
                    user: userdb,
                    id: userdb._id,
                    token: token
                });
            }
        } else {
            // the user doesnt exist, needs to create
            var userNew = new UserModel();
            
            userNew.name = googleUser.name;
            userNew.email = googleUser.email;
            userNew.image = googleUser.img;
            userNew.google = true;
            userNew.password = ':)';
            userNew.google = true;


            userNew.save( (err, userdb) => {
                if (err){
                    return res.status(500).json({
                        ok : false,
                        mensaje: 'error creating user',
                        errors: err
                    });
                } else {
                    var token = jwt.sign( { user: userdb }, SEED, { expiresIn: 14400} ); //4 hours
                    res.status(200).json({
                        ok: true,
                        message : 'valid login post',
                        user: userdb,
                        id: userdb._id,
                        token: token
                    });
                }
            });
        }

    });

    // res.status(200).json({
    //     ok: true,
    //     message : 'valid login post',
    //     user: googleUser
    // });
})



// ===========================================================
// Login normal user
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

        res.status(200).json({
            ok: true,
            message : 'valid login post',
            user: user,
            id: user._id,
            token: token
        });
    });
    


    




});


module.exports = app;