// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Import paths
var appRoutes = require('./routes/app');
var appSearch = require('./routes/search');
var appUsers = require('./routes/user');
var appHospital = require('./routes/hospital');
var appDoctor = require('./routes/doctor');
var appUpload = require('./routes/upload');
var appImages = require('./routes/imgs');
var appLogin = require('./routes/login');

// Init variables
var app = express();

// Cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE, OPTIONS");
    next();
  });



//Server index config ========== alows explore folder in the web browser
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));




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



// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Paths
app.use('/doctor', appDoctor);
app.use('/hospital', appHospital);
app.use('/user', appUsers);
app.use('/search', appSearch);
app.use('/upload', appUpload);
app.use('/img', appImages);
app.use('/login', appLogin);

app.use('/', appRoutes);


// Express listen requeris
app.listen(3000, () => {
    console.log('Express server running in port 3000: \x1b[32m%s\x1b[0m', 'online');
});