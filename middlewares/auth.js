
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