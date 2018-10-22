var express = require('express');
var authMiddleware = require('../middlewares/auth');
var app = express();
var doctorSchema = require('../models/doctor');

// ===========================================================
// get all doctors
// ===========================================================
app.get('/', (req, resp) => {

    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 5;
    limit = Number(limit);
    
    doctorSchema.find({})
    .populate('user', 'name email') // field that i want to see the detail relationship
    .populate('hospital', 'name') // field that i want to see the detail relationship
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

        doctorSchema.countDocuments({}, (err, count) => {
            resp.status(200).json({
                ok : true,
                total: count,
                collection: data 
            });
        });
    });
});

// ===========================================================
// Create doctor
// ===========================================================
app.post('/', authMiddleware.validateToken, (req, resp) => {
    var body = req.body;

    var doctor = new doctorSchema({
        name: body.name,
        image: body.image,
        user: req.user._id, //comes from token auth
        hospital: body.hospital
    });

    doctor.save( (err, doctorSaved) => {
        if (err){
            return resp.status(400).json({
                ok : false,
                message: 'error creating doctor',
                errors: err
            });
        }
        return resp.status(201).json({
            ok : true,
            doctor: doctorSaved 
        });
    });


});


// ===========================================================
// update doctor
// ===========================================================
app.put('/:id', authMiddleware.validateToken, (req, resp) => {
    var body = req.body;
    var idDoctor = req.params.id;

    doctorSchema.findById(idDoctor, (err, doctor) => {
        if (err) {
            return resp.status(500).json({
                ok : false,
                message: 'error searching doctor',
                errors: err
            });
        }
        if ( !doctor) {
            return resp.status(400).json({
                ok : false,
                message: 'doctor with id: ' + idDoctor + ' not found'
       
            });
        }

        doctor.name = body.name;
        doctor.hospital = body.hospital;
        doctor.image = body.image;
        doctor.user = req.user._id;//comes from token auth

        doctor.save( (err, doctorSaved) => {
            if (err) {
                return resp.status(500).json({
                    ok : false,
                    message: 'error updating doctor',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                doctor : doctorSaved
            });
            
        });
    });
});

// ===========================================================
// delete doctor
// ===========================================================
app.delete('/:id', authMiddleware.validateToken, (req, resp) => {
    var idDoctor = req.params.id;
    doctorSchema.findByIdAndDelete(idDoctor, (err, deletedDoctor) => {
        if (err){
            return resp.status(500).json({
                ok : false,
                message: 'error searching hospital',
                errors: err
            });
        }
        if ( !deletedDoctor ) {
            return resp.status(400).json({
                ok : false,
                message: 'there is not doctor with id: ' + idDoctor
       
            });
        }

        return resp.status(200).json({
            ok : true,
            doctor: deletedDoctor
        });

    });
});

module.exports = app;
