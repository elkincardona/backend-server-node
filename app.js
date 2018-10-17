// Requires
var express = require('express');
var mongoose = require('mongoose');


// Init variables
var app = express();


// Connection Mongo Db
mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }).then(
    () => {
        console.log('Database server running in port 27017: \x1b[32m%s\x1b[0m', 'online');
    },
    error => {
        if (error) {
            console.log('\x1b[31m%s\x1b[0m','Connection Error');
            throw error;
        }
    }
);


// Paths
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok : true,
        mensaje: 'request perform correctly'
    });

});  


// Express listen requeris
app.listen(3000, () => {
    console.log('Express server running in port 3000: \x1b[32m%s\x1b[0m', 'online');
});