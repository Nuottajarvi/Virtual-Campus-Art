var db = require('./../db');
var moment = require('moment');

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
            var query = 'SELECT model_id, title, created_at, rating FROM models';

            /*
                Check query type:
                rated - return models ordered by their ratings
                new - return models ordered by date
                random - returns models randomly ordered weighted by ratings.
            */
            var type = '';
            if (req.query.type === 'rated') {
                type += ' ORDER BY rating DESC'; 
            } else if (req.query.type === 'new') {
                type += ' ORDER BY created_at DESC';
            } else if (req.query.type === 'randomrating') {
                type += ' WHERE model_id IN (SELECT model_id FROM (SELECT model_id FROM models' +
                 ' ORDER BY -LOG(RAND())/(ABS(rating) + 1)';
            } else if (req.query.type === 'randomnew') {
                type += ' WHERE model_id IN (SELECT model_id FROM (SELECT model_id FROM models' +
                 ' ORDER BY -LOG(RAND())/(ABS(created_at) + 1)';
            }

            // Limit how many entries are returned.
            var limit = '';
            if (req.query.l) {
                var n = +req.query.l || 1;
                limit += ' LIMIT ' + connection.escape(n);
            }

            query += type + limit;
            if (req.query.type == 'randomrating' || req.query.type == 'randomnew') {
                query += ') A)';
            }
            query += ';';

            connection.query(query, function (error, results, fields) {

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

        if (!model.created_at) {
            model.created_at = moment().format('YYYY-MM-DD H:mm:ss');
        }

        if (!model.rating) {
            model.rating = 0;
        }

        db.getPool().getConnection(function (err, connection) {
            connection.query('INSERT INTO models SET ?', model, function (error, results, fields) {

                connection.release();

                if (error) {
                    res.status(500).json({message: error});
                } else {
                    res.location('/api/models/' + results.insertId);
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

    function changeRating(req, res, upvoting) {
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
                        if (upvoting) {
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