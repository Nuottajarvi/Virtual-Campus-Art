
module.exports = function errorRoute(app) {
    app.use(function (req, res) {
        res.status(404).json({
        url: req.originalUrl,
        error: 'Not found'
        });
    });
}