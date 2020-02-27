const express = require('express');
const bodyParser = require('body-parser');
const phantomjs = require('phantomjs-prebuilt');
const app = express();
const cytoRouter = express.Router();
const WritableStream = require("stream").Writable;
const childProcess = require('child_process');
const binPath = phantomjs.path;
const path = require("path");

cytoRouter.post("/render", (req, res) => {
    const cytoConfig = req.body;
    let cy = null;

    const childArgs = [
        path.join(__dirname, 'cyto.js'),
        JSON.stringify(cytoConfig),
    ];
    childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        } else {
            console.log(stdout);
        }
        res.json(stdout);
    });
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({limit: "10MB", type: 'application/json'}));
app.use("/cyto-api", cytoRouter);

app.use((error, req, res, next) => {
    if (error) {
        console.log(error);
        res.json({
            error,
        });
    }
});


module.exports = app;