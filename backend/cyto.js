var system = require("system");
var page = require('webpage').create();

page.onConsoleMessage = function (msg) {
    console.log(msg);
    phantom.exit();
};
const cytoConfigStr = system.args[1];

page.open("http://localhost:3003/cyto.html", function () {
    page.includeJs("http://localhost:3003/cytoscape.js", function () {
        page.evaluate(function (cytoConfigStr) {
            window.render(JSON.parse(cytoConfigStr));
        }, cytoConfigStr);
    })
});
