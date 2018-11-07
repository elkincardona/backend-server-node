var express = require('express');
var app = express();
var hospitalSchema = require('../models/hospital');
var doctorSchema = require('../models/doctor');
var userSchema = require('../models/user');

// ===========================================================
// Get all search results in one collection
// ===========================================================
app.get('/collection/:collection/:filter', (req, res, next) => {
    var skip = req.query.skip || 0;
    skip = Number(skip);
    var limit = req.query.limit || 5;
    limit = Number(limit);
    var sCollection = req.params.collection;
    var filter = req.params.filter;
    var regex = new RegExp( filter, 'i');
    var promise;

    switch (sCollection) {
        case 'hospitals':
            promise = searchHospitals(filter, regex, skip, limit);
            
        break;
        case 'users':
            promise = searchUsers(filter, regex, skip, limit);

        break;
        case 'doctors':
            promise = searchDoctors(filter, regex, skip, limit)

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
            [sCollection]: response.data,
            total: response.total
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
    var skip = req.query.skip || 0;
    skip = Number(skip);
    var limit = req.query.limit || 5;
    limit = Number(limit);
    var filter = req.params.filter;
    var regex = new RegExp( filter, 'i');
    
    Promise.all([
        searchHospitals(filter, regex, skip, limit), 
        searchDoctors(filter, regex, skip, limit), 
        searchUsers(filter, regex, skip, limit)])
        .then( responses => {
            res.status(200).json({
                ok: true,
                hospitals: responses[0].data,
                totalHospitals: responses[0].total,
                doctors: responses[1].data,
                totalDoctors: responses[1].total,
                users: responses[2].data,
                totalUsers: responses[2].total
                
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

function searchHospitals (filter, regex, skip, limit ) {

    return new Promise( (resolve, reject) => {
        hospitalSchema.find({ name: regex })
        .populate('user', 'name email image')
        .skip(skip)
        .limit(limit)
        .exec( (err, data) => {
            if (err) {
                reject('error searching hospitals');
            }
            else {
                //Calculate total
                hospitalSchema.countDocuments({ name: regex })
                //.find({ name: regex })
                .exec( (err, count) => {
                    resolve({data, total: count});
                });
                // resolve(data);
            }
        });
    });
}

function searchDoctors (filter, regex, skip, limit) {

    return new Promise( (resolve, reject) => {
        doctorSchema.find({ name: regex })
        .populate('user', 'name email image')
        .populate('hospital', 'name')
        .skip(skip)
        .limit(limit)
        .exec( (err, data) => {
            if (err) {
                reject('error searching doctors');
            }
            else {


                //Calculate total
                doctorSchema.countDocuments({ name: regex })
                //.find({ name: regex })
                .exec( (err, count) => {
                    resolve({data, total: count});
                });


                //resolve(data);
            }
        });
    });
}

function searchUsers (filter, regex, skip, limit) {

    return new Promise( (resolve, reject) => {
        userSchema.find({}, 'name email role image')
        .or([{ name: regex }, { email: regex }])
        .skip(skip)
        .limit(limit)
        .exec( (err, data) => {
            if (err) {
                reject('error searching users');
            }
            else {

                //Calculate total
                userSchema.countDocuments({})
                .or([{ name: regex }, { email: regex }])
                .exec( (err, count) => {
                    resolve({data, total: count});
                });

                //resolve({data});
            }
        });
    });
}

module.exports = app;