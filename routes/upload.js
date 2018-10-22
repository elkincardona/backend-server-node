var express = require('express');
var fileUpload = require('express-fileupload');
var userSchema = require('../models/user');
var hospitalSchema = require('../models/hospital');
var doctorSchema = require('../models/doctor');
var fs = require('fs');
var app = express();

// default options
app.use(fileUpload());



app.put('/:collection/:id', function(req, res) {

    var sCollection = req.params.collection;
    var idElement = req.params.id;

    var validCollections = ['hospitals', 'users', 'doctors'];

    if ( validCollections.indexOf(sCollection) < 0){
        return res.status(400).json({
            ok: false,
            errors: 'Invalid collection, only accepts: '+ validCollections.join(', ')
        });
    }

    if (!req.files) {
      return res.status(400).json({
          ok: false,
          errors: 'No files to upload'
      });
      
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var file = req.files.image;
    var splitName = file.name.split('.');
    var fileExt = splitName[splitName.length-1];

    //Valid extensiones
    var validExtensions = ['jpg', 'png' , 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExt) < 0)
    {
        return res.status(400).json({
            ok: false,
            errors: 'Invalid file extension, only ' + validExtensions.join(', ') + ' are allowed'
        });
    }

    //custom file name  iduser-random.png
    var fileName = `${idElement}-${ new Date().getMilliseconds() }.${fileExt}`;

    //Move file from temp to path
    var path = `./uploads/${sCollection}/${fileName}`;
    file.mv(path, error => {
        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error moving file',
                errors: error
            });
        }
        uploadByCollection(sCollection, idElement, path, fileName, res);




        


    });


    
    
  
    // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
    //   if (err)
    //     return res.status(500).send(err);
  
    //   res.send('File uploaded!');
    // });
  });



  function uploadByCollection(collection, idElement, path, fileName, response) {

    switch ( collection ) {
        case 'users':
            userSchema.findById(idElement, ( err, data) => {
                if(!data) {
                    return response.status(400).json({ok: false, message: 'user doesnt exits'});
                }
                proccessFile(data, collection, fileName, response);
            });

        break;

        case 'hospitals':

            hospitalSchema.findById(idElement, ( err, data) => {
                if(!data) {
                    return response.status(400).json({ok: false, message: 'hospital doesnt exits'});
                }
                proccessFile(data, collection, fileName, response);
            });

            
        break;

        case 'doctors':
            doctorSchema.findById(idElement, ( err, data) => {
                if(!data) {
                    return response.status(400).json({ok: false, message: 'doctor doesnt exits'});
                }
                proccessFile(data, collection, fileName, response);
            });

            
            
        break;
    }
  }


  function proccessFile(data, collection, fileName, response) {
    if (data.image)
    {
        var oldPath = `./uploads/${collection}/${data.image}`;

        // delete file if exists
        if ( fs.existsSync(oldPath) ) {
            fs.unlink(oldPath, (err) =>{

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error removing old file',
                        errors: error
                    });
                }
            });
        }
    }
    data.image = fileName;
    data.save( (err, elmSaved) => {

        return response.status(200).json({
        ok: true,
        message: `${collection} image updated`,
        [collection]: elmSaved
        });

    });
  }


module.exports = app;