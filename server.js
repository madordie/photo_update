var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
var multer = require('multer')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

var storage = multer.diskStorage({
    destination: function(req, file, cb) { cb(null, "public/files/") },
    filename: function(req, file, cb) {
        cb(null, (new Date()).getTime() + "_" + file.originalname);
    }
})

app.post('/file_upload', multer({ dest: 'public/files/', storage: storage }).single('file'), function(req, res) {
    response = {
        message: 'File uploaded successfully',
    };
    res.end(JSON.stringify(response));
})

app.get('/files', function(req, res) {
    var urls = [],
        files = fs.readdirSync(__dirname + '/public/files/'),
        deleteTime = (new Date()).getTime() - 24 * 60 * 60 * 1000;

    files.filter((file) => {
        return file.indexOf('.');
    }).forEach(function(file) {
        if (parseInt(file) < deleteTime) {
            fs.unlinkSync(__dirname + '/public/files/' + file)
        } else {
            urls.push('/files/' + file)
        }
    })

    urls = urls.sort().reverse()
    while (urls.length > 50) {
        var url = urls.pop()
        fs.unlinkSync(__dirname + '/public' + url)
    }
    res.set('Content-Type', 'application/json; charset=utf-8');

    res.end(JSON.stringify(urls));
})

var server = app.listen(8081, function() {

    fs.exists(__dirname + "/public/files/", function(exists) {
        if (!exists) {
            fs.mkdirSync(__dirname + "/public/files/");
        }
    });

    var host = server.address().address
    var port = server.address().port

    console.log("图床已启动 http://%s:%s/index.html", host, port)
})