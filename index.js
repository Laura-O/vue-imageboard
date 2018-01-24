const express = require('express');
const app = express();
const db = require('./db.js');
const config = require('./config');

const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const knox = require('knox');
let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'peachan',
});

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(express.static('./public'));

app.get('/db', (req, res) => {
    const query = 'SELECT * FROM images';
    db
        .query(query)
        .then(results => {
            for (var i = 0; i < results.rows.length; i++) {
                results.rows[i].image = config.s3Url.concat(results.rows[i].image);
            }
            return res.json(results.rows);
        })
        .catch(err => {
            console.error('query error', err.message, err.stack);
        });
});

app.get('/comments/:id', (req, res) => {
    const query = 'SELECT * FROM comments WHERE image_id = $1';

    db
        .query(query, [req.params.id])
        .then(results => {
            res.send(results.rows);
        })
        .catch(err => {
            console.error('query error', err.message, err.stack);
        });
});

app.post('/comment', function(req, res) {
    console.log(req.body);

    res.send('ok');
    const query = 'INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3)';

    db
        .query(query, [req.body.comment, req.body.user, req.body.id])
        .then(() => {
            console.log('success');
        })
        .catch(err => {
            console.log(err);
            res.json({ success: false });
        });
});

app.post('/upload-image', uploader.single('file'), function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    if (req.file) {
        const { username, title, description } = req.body;

        const s3Request = client.put(req.file.filename, {
            'Content-Type': req.file.mimetype,
            'Content-Length': req.file.size,
            'x-amz-acl': 'public-read',
        });
        const readStream = fs.createReadStream(req.file.path);
        readStream.pipe(s3Request);

        s3Request.on('response', s3Response => {
            const wasSuccessful = s3Response.statusCode == 200;
            const query =
                'INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4)';

            db
                .query(query, [req.file.filename, username, title, description])
                .then(() => {
                    res.json({ success: wasSuccessful });
                })
                .catch(err => {
                    console.log(err);
                    res.json({ success: false });
                });
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080);
