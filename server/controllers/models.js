var db = require('./../db');

module.exports = function modelCtrl() {
    function paramModel(req, res, next, model_id) {
        db.getPool().getConnection(function (err, connection) {
            connection.query('SELECT * FROM models where model_id = ?', [+model_id], function (error, results, fields) {
                connection.release();

                if (error) {
                    next(error);
                } else if (results.length < 1) {
                    res.sendStatus(404);
                    next();
                } else {
                    req.model = results[0];
                    req.model.data = JSON.parse(req.model.data);
                    next();
                }
            });
        });
    }

    function find(req, res) {
        db.getPool().getConnection(function (err, connection) {
            connection.query('SELECT model_id, title, created_at, rating FROM models', function (error, results, fields) {

                connection.release();

                if (error) {
                    res.status(500).json({message: error});
                } else {
                    res.json(results);
                }
            });
        });
    }

    function create(req, res) {
        var model = req.body;
        model.data = JSON.stringify(model.data);

        db.getPool().getConnection(function (err, connection) {
            connection.query('INSERT INTO models SET ?', model, function (error, results, fields) {

                connection.release();

                if (error) {
                    res.status(500).json({message: error});
                } else {
                    res.sendStatus(201);
                }
            });
        });
    }

    function upvote(req, res) {
        changeRating(req, res, true);
    }

    function downvote(req, res) {
        changeRating(req, res);
    }

    function changeRating(req, res, up) {
        var data = req.body;

        if (data.id) {
            db.getPool().getConnection(function (err, connection) {
                connection.query('SELECT * FROM models where model_id = ?', [+data.id], function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(500).json({message: error});
                    } else if (results.length < 1) {
                        res.sendStatus(404);
                    } else {
                        var model = results[0];
                        model.data = JSON.parse(model.data);
                        var rating;
                        if (up) {
                            rating = model.rating ? model.rating + 1 : 1;
                        } else {
                            rating = model.rating ? model.rating - 1 : -1;
                        }

                        db.getPool().getConnection(function (err, connection) {
                            connection.query('UPDATE models SET rating = ? WHERE model_id = ?', [rating, +data.id], 
                            function (error, results, fields) {
                                connection.release();

                                if (error) {
                                    res.status(500).json({message: error});
                                } else {
                                    res.sendStatus(200);
                                }
                            });
                        });
                    }
                });
            });
        } else {
            res.sendStatus(500);
        }
    }

    function get(req, res) {
        res.json(req.model);
    }

    function getData(req, res) {
        res.json(req.model.data);
    }

    function getRating(req, res) {
        res.json(req.model.rating);
    }

    return {
        paramModel,
        find,
        create,
        upvote,
        downvote,
        get: get,
        getData,
        getRating
    };
}