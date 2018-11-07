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
                message: 'error finding user',
                errors: err
            });
        }

        if ( userdb ){
            if ( userdb.google === false) {
                return res.status(400).json({
                    ok : false,
                    message: 'must authenticate with the normal account',
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
                    token: token,
                    menu: getMenu(userdb.role)
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
                        message: 'error creating user',
                        errors: err
                    });
                } else {
                    var token = jwt.sign( { user: userdb }, SEED, { expiresIn: 14400} ); //4 hours
                    res.status(200).json({
                        ok: true,
                        message : 'valid login post',
                        user: userdb,
                        id: userdb._id,
                        token: token,
                        menu: getMenu(userdb.role)
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
                message: 'error finding user',
                errors: err
            });
        }
        if ( !user ) {
            return res.status(400).json({
                ok : false,
                message: 'invalid user credentials - email' 
            });
        }
        if ( !bcrypt.compareSync( body.password , user.password) ) {
            return res.status(400).json({
                ok : false,
                message: 'invalid user credentials - password'
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
            token: token,
            menu: getMenu(user.role)
        });
    });
    

});


function getMenu( role ) {
    var menuOptions = [
        {
          tittle: 'Main',
          icon: 'mdi mdi-gauge',
          submenus: [
            {tittle: 'Dashboard', icon: 'mdi mdi-gauge', url: '/dashboard'},
            {tittle: 'Progress bar', icon: 'mdi mdi-gauge', url: '/progress'},
            {tittle: 'Graphic', icon: 'mdi mdi-gauge', url: '/graphics1'},
            {tittle: 'Promises', icon: 'mdi mdi-gauge', url: '/promises'},
            {tittle: 'Rxjs', icon: 'mdi mdi-gauge', url: '/rxjs'}
          ]
        },
        {
          tittle: 'Admin',
          icon: 'mdi mdi-folder-lock-open',
          submenus: [
            // {tittle: 'Users', icon: 'mdi mdi-gauge', url: '/users'},
            {tittle: 'Doctors', icon: 'mdi mdi-gauge', url: '/doctors'},
            {tittle: 'Hospitals', icon: 'mdi mdi-gauge', url: '/hospitals'}
          ]
    
        }
      ];

      if(role == 'admin_role') {
          menuOptions[1].submenus.unshift({tittle: 'Users', icon: 'mdi mdi-gauge', url: '/users'});
      }
    return menuOptions;
}


module.exports = app;