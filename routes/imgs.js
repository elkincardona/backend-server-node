var express = require('express');
const path = require('path');
const fs = require('fs');
var app = express();

// Paths
app.get('/:collection/:imgName', (req, res, next) => {

    var pCollection = req.params.collection;
    var pImgName = req.params.imgName;

    // dirname get physical path of project
    var imgPath = path.resolve(__dirname, `../uploads/${pCollection}/${pImgName}`);
    if ( fs.existsSync(imgPath) ) {
        res.sendFile(imgPath);
    }
    else {
        var noImagePath = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(noImagePath);
    }


});  

module.exports = app;