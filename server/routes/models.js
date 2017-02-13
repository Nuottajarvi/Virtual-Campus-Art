var express = require('express');

module.exports = function modelRoute(app) {
    var router = express.Router();
    var controller = require('./../controllers/models')();

    router.param('Model', controller.paramModel);

    router.route('/api/models')
        .get(controller.find)
        .post(controller.create);

    router.route('/api/models/upvote')
        .post(controller.upvote);

    router.route('/api/models/downvote')
        .post(controller.downvote);
    
    router.route('/api/models/:Model')
        .get(controller.get);
    
    router.route('/api/models/:Model/data')
        .get(controller.getData);

    router.route('/api/models/:Model/rating')
        .get(controller.getRating);
    
    app.use(router);
}