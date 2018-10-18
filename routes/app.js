var express = require('express');
var app = express();

// Paths
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok : true,
        mensaje: 'request perform correctly'
    });

});  

module.exports = app;