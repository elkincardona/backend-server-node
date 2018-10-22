var express = require('express');
var bcrypt = require('bcryptjs');
var authMiddleware = require('../middlewares/auth');
// var SEED = require('../config/config').SEED;

var app = express();

var UserSchema = require('../models/user');


// ===========================================================
// Get all users without token
// ===========================================================
app.get('/', (req, res, next) => {
    
    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 5;
    limit = Number(limit);

    UserSchema.find({},'name email image role')
        .skip(skip)
        .limit(limit)
        .exec( 
        (err, userCollection) => {
        if (err){
            return res.status(500).json({
                ok : false,
                message: 'error finding data',
                errors: err
            });
        }

        UserSchema.countDocuments({}, (err, count) => {
            res.status(200).json({
                ok : true,
                total: count,
                collection: userCollection 
            });
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
//                 message: 'invalid token',
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

    UserSchema.findById(idUser, (err, resp) => {
        if (err){
            return res.status(500).json({
                ok : false,
                message: 'error when searching user',
                errors: err
            });
        }
        if ( !resp ) {
            return res.status(400).json({
                ok : false,
                message: 'user with id: ' + idUser + ' not found'
       
            });
        }

        resp.name = body.name;
        resp.email = body.email;
        res.role = body.role;

        resp.save( (err, savedUser) => {
            if (err){
                return res.status(400).json({
                    ok : false,
                    message: 'error updating user',
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
    
    var user = new UserSchema({
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
                message: 'error creating user',
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
    UserSchema.findByIdAndDelete(idUser, (err , deletedUser) => {
        if (err){
            return res.status(500).json({
                ok : false,
                message: 'error deleting user',
                errors: err
            });
        }
        
        if ( !deletedUser ) {
            return res.status(400).json({
                ok : false,
                message: 'there is not user with id: ' + idUser
       
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