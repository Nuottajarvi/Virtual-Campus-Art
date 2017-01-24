var db = require('./../db');

module.exports = function modelCtrl() {
    function paramModel(req, res, next, model_id) {
        db.getPool().getConnection(function (err, connection) {
            connection.query('SELECT * FROM models where model_id = ?', [+model_id], function (error, results, fields) {
                connection.release();

                if (error) {
                    next(error);
                } else if (results.length < 1) {
                    next(res.sendStatus(404));
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
            connection.query('SELECT model_id, title, created_at FROM models', function (error, results, fields) {

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

    function get(req, res) {
        res.json(req.model);
    }

    function getData(req, res) {
        res.json(req.model.data);
    }

    return {
        paramModel,
        find,
        create,
        get: get,
        getData
    };
}