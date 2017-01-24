var express = require('express');

module.exports = function modelRoute(app) {
    var router = express.Router();
    var controller = require('./../controllers/models')();

    router.param('Model', controller.paramModel);

    router.route('/api/models')
        .get(controller.find)
        .post(controller.create);
    
    router.route('/api/models/:Model')
        .get(controller.get);
    
    router.route('/api/models/:Model/data')
        .get(controller.getData);
    
    app.use(router);
}