// out backend file

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const csv = require('csv-parser')
const fs = require('fs')


//app.use('/', express.static('frontend'));  Do i need this line?

app.get("/", (req, res) => res.send("Hello World")); //define a route for '/'

app.get("/score_records",
    (req, res) => {
        const results = [];
        fs.createReadStream('./score-records.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
                res.send(results);
            });
        //res.sendFile(path.resolve(__dirname, 'index.html'));
    })

app.get("/companies",
    (req, res) => {
        const results = [];
        fs.createReadStream('./companies.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
                res.send(results);
            });
        //res.sendFile(path.resolve(__dirname, 'index.html'));
    })


app.listen(port, () => console.log(`Server is running on port ${port}`));
