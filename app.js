// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Connection Mongo Db *****THE DATABASE NAME IS CASESENSITIVE
mongoose.connect('mongodb://localhost:27017/HospitalDB', {useNewUrlParser: true }).then(
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


// Init variables
var app = express();


// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Import paths
var appRoutes = require('./routes/app');
var appUsers = require('./routes/user');
var appLogin = require('./routes/login');


// Paths
app.use('/user', appUsers);
app.use('/login', appLogin);
app.use('/', appRoutes);

// Express listen requeris
app.listen(3000, () => {
    console.log('Express server running in port 3000: \x1b[32m%s\x1b[0m', 'online');
});