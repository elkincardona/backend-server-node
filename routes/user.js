var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authMiddleware = require('../middlewares/auth');
// var SEED = require('../config/config').SEED;

var app = express();

var UserModel = require('../models/user');


// ===========================================================
// Get all users without token
// ===========================================================
app.get('/', (req, res, next) => {
    
    UserModel.find({},'name email image role').exec( 
        
        (err, userCollection) => {
        if (err){
            return res.status(500).json({
                ok : false,
                mensaje: 'error',
                errors: err
            });
        }
        res.status(200).json({
            ok : true,
            mensaje: 'request users perform correctly',
            userCollection: userCollection 
        });

    });

    

});  


// ===========================================================
// Validate token JWT  ---> middleware
// ************* the elements to validate token needs to be below this code *******************
// ===========================================================
// app.use('/', (req, resp, next) => {
//     var token = req.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {

//         if (err) {
//             return resp.status(401).json({
//                 ok : false,
//                 mensaje: 'invalid token',
//                 errors: err
       
//             });
//         }

//         next();

//     });

// });


// ===========================================================
// Update user
// ===========================================================
app.put('/:id', authMiddleware.validateToken, (req, res) => {
    var body = req.body;
    var idUser = req.params.id;

    UserModel.findById(idUser, (err, resp) => {
        if (err){
            return res.status(500).json({
                ok : false,
                mensaje: 'error when searching user',
                errors: err
            });
        }
        if ( !resp ) {
            return res.status(400).json({
                ok : false,
                mensaje: 'error when searching user with id: ' + idUser
       
            });
        }

        resp.name = body.name;
        resp.email = body.email;
        res.role = body.role;

        resp.save( (err, savedUser) => {
            if (err){
                return res.status(400).json({
                    ok : false,
                    mensaje: 'error when updating user',
                    errors: err
                });
            }
            savedUser.password = ':)';
            res.status(200).json({
                ok: true,
                user : savedUser
            });
        });
    });
});

// ===========================================================
// Create a new user
// ===========================================================
app.post('/', authMiddleware.validateToken , (req, res) => {

    var body = req.body;
    var salt = bcrypt.genSaltSync(10);
    
    var user = new UserModel({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, salt),
        image: body.image,
        role: body.role
    });

    user.save( ( err, savedUser) => {

        if (err){
            return res.status(400).json({
                ok : false,
                mensaje: 'error when creating user',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user : savedUser
        });

    });




});


// ===========================================================
// Delete user
// ===========================================================
app.delete('/:id', authMiddleware.validateToken, (req, res) => {
    var idUser = req.params.id;
    UserModel.findByIdAndDelete(idUser, (err , deletedUser) => {
        if (err){
            return res.status(500).json({
                ok : false,
                mensaje: 'error when deleting user',
                errors: err
            });
        }
        
        if ( !deletedUser ) {
            return res.status(400).json({
                ok : false,
                mensaje: 'there is not user with id: ' + idUser
       
            });
        }

        deletedUser.password = ':)';
        return res.status(200).json({
            ok : true,
            user: deletedUser
        });
    });
});

module.exports = app;