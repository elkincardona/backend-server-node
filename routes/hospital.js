var express = require('express');
var authMiddleware = require('../middlewares/auth');
var app = express();
var hospitalSchema = require('../models/hospital');

// ===========================================================
// Get all hospitals
// ===========================================================
app.get('/', (req, resp) => {

    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 5;
    limit = Number(limit);

    hospitalSchema.find({})
    .populate('user', 'name email') // field that i want to see the detail relationship
    .skip(skip)
    .limit(limit)
    .exec( (err, data) => {

        if (err) {
            return resp.status(500).json({
                ok : false,
                message: 'error finding data',
                errors: err
            });
        }
        hospitalSchema.countDocuments({}, (err, count) => {
            resp.status(200).json({
                ok : true,
                total: count,
                collection: data 
            });
        });

    });
});

// ===========================================================
// create new hospital
// ===========================================================
app.post('/', authMiddleware.validateToken, (req, resp) => {
    var body = req.body;
    var hospital = new hospitalSchema({
        name: body.name,
        image: body.image,
        user: req.user._id//comes from token auth
    });

    hospital.save( (err, savedHospital) => {
        if (err){
            return resp.status(400).json({
                ok : false,
                message: 'error creating hospital',
                errors: err
            });
        }
        return resp.status(201).json({
            ok : true,
            hospital: savedHospital 
        });

    });

    

});

// ===========================================================
// update hospital
// ===========================================================
app.put('/:id', authMiddleware.validateToken, (req, resp) => {
    var body = req.body;
    var idHospital= req.params.id;

    hospitalSchema.findById(idHospital, (err, data) => {

        if (err){
            return resp.status(500).json({
                ok : false,
                message: 'error searching hospital',
                errors: err
            });
        }
        if ( !data ) {
            return resp.status(400).json({
                ok : false,
                message: 'hospital with id: ' + idHospital + ' not found'
       
            });
        }

        data.name = body.name;
        data.image = body.image;
        data.user = req.user._id;//comes from token auth

        data.save( (err, savedHospital) => {
            if (err){
                return resp.status(400).json({
                    ok : false,
                    message: 'error updating hospital',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                hospital : savedHospital
            });
        });


    });

});

// ===========================================================
// delete hospital
// ===========================================================
app.delete('/:id', authMiddleware.validateToken, (req, resp) => {
    var idHospital = req.params.id;
    hospitalSchema.findByIdAndDelete(idHospital, (err, deletedHospital) => {
        if (err){
            return resp.status(500).json({
                ok : false,
                message: 'error searching hospital',
                errors: err
            });
        }
        if ( !deletedHospital ) {
            return resp.status(400).json({
                ok : false,
                message: 'there is not user with id: ' + idHospital
       
            });
        }

        return resp.status(200).json({
            ok : true,
            hospital: deletedHospital
        });

    });
});


module.exports = app;