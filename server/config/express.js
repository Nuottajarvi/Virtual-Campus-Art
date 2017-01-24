var bodyParser = require('body-parser');

module.exports = function expressConfig(app) {
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ extended: false }));
};