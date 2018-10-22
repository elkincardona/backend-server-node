var express = require('express');
var app = express();
var hospitalSchema = require('../models/hospital');
var doctorSchema = require('../models/doctor');
var userSchema = require('../models/user');

// ===========================================================
// Get all search results in one collection
// ===========================================================
app.get('/collection/:collection/:filter', (req, res, next) => {
    var sCollection = req.params.collection;
    var filter = req.params.filter;
    var regex = new RegExp( filter, 'i');
    var promise;

    switch (sCollection) {
        case 'hospitals':
            promise = searchHospitals(filter, regex);
            
        break;
        case 'users':
            promise = searchUsers(filter, regex);

        break;
        case 'doctors':
            promise = searchDoctors(filter, regex)

        break;

        default:
            res.status(400).json({
                ok: false,
                errors: 'you need to specify a correct collection'
            });
        break;
    }

    promise.then( response => {
        res.status(200).json({
            ok: true,
            [sCollection]: response
        });
    })
    .catch( err => {
        res.status(500).json({
            ok: false,
            errors: err
        });
    });

});




// ===========================================================
// Get all search results in all collections
// ===========================================================
app.get('/all/:filter', (req, res, next) => {

    var filter = req.params.filter;
    var regex = new RegExp( filter, 'i');
    
    Promise.all([
        searchHospitals(filter, regex), 
        searchDoctors(filter, regex), 
        searchUsers(filter, regex)])
        .then( responses => {
            res.status(200).json({
                ok: true,
                hospitales: responses[0],
                doctors: responses[1],
                users: responses[2]
            });
        })
        .catch( err => {
            res.status(500).json({
                ok: false,
                errors: err
            });
        });


    // searchHospitals(filter, regex)
    // .then( hospitals => {
    //     res.status(200).json({
    //         ok: true,
    //         data: hospitals
    //     });
    // })
    // .catch()
    



});  

function searchHospitals (filter, regex) {

    return new Promise( (resolve, reject) => {
        hospitalSchema.find({ name: regex })
        .populate('user', 'name email')
        .exec( (err, data) => {
            if (err) {
                reject('error searching hospitals');
            }
            else {
                resolve(data);
            }
        });
    });
}

function searchDoctors (filter, regex) {

    return new Promise( (resolve, reject) => {
        doctorSchema.find({ name: regex })
        .populate('user', 'name email')
        .populate('hospital', 'name')
        .exec( (err, data) => {
            if (err) {
                reject('error searching doctors');
            }
            else {
                resolve(data);
            }
        });
    });
}

function searchUsers (filter, regex) {

    return new Promise( (resolve, reject) => {
        userSchema.find({}, 'name email role')
        .or([{ name: regex }, { email: regex }])
        .exec( (err, data) => {
            if (err) {
                reject('error searching users');
            }
            else {
                resolve(data);
            }
        });
    });
}

module.exports = app;