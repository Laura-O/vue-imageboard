const express = require("express");
const app = express();
const db = require("./db.js");

app.use(express.static("./public"));

app.get("/db", (req, res) => {
    const query = "SELECT * FROM images";
    db
        .query(query)
        .then(results => {
            console.log(results);
            return res.json(results.rows);
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

app.listen(8080);
