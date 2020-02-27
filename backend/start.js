const app = require('./server');

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log("server starts at " + port);
});