
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ===========================================================
// Validate token JWT  ---> middleware
// ===========================================================
module.exports.validateToken = function (req, resp, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return resp.status(401).json({
                ok : false,
                message: 'invalid token',
                errors: err
       
            });
        }
        // return resp.status(200).json({
        //     ok : true,
        //     decoded: decoded
   
        // });

        // this line include user data for all request
        req.user = decoded.user;

        next();

    });
}

// ===========================================================
// Validate admin or same user
// ===========================================================
module.exports.validateAdminRoleorSameUser = function (req, resp, next) {

    var user = req.user;
    var id = req.params.id;

    if( user.role == 'admin_role' || user._id == id) {
        next();
        return;
    } else {
        return resp.status(401).json({
            ok : false,
            message: 'invalid access',
            errors: 'invalid access'
   
        });
    }
}


// ===========================================================
// Validate admin or same user
// ===========================================================
module.exports.validateAdminRole = function (req, resp, next) {

    var user = req.user;

    if( user.role == 'admin_role') {
        next();
        return;
    } else {
        return resp.status(401).json({
            ok : false,
            message: 'invalid access',
            errors: 'invalid access'
   
        });
    }
}