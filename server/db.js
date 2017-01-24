var mysql = require('mysql');
var readline = require('readline');
var fs = require('fs');

var config = require('./config/db_config');

var pool = null;

/**
 * Return the database pool.
 */
function getPool() {
    return pool ? pool : mysql.createPool(config);
}

/**
 * Initializes database connection, and created a schema if no such yet.
 */
function initialize() {
    getPool().getConnection(function (err, connection) {
        if (err) {
            var con = mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password
            });

            con.connect(function (error) {
                if (error) {
                    console.log('Cannot connect to the database! Exiting...');
                    process.exit(1);
                }
            });

            dumpSchema(con);
            console.log('Database initialized!');
        } else {
            console.log('Database connected!');
        }
    });
}

/**
 * Empties the database.
 */
function clean() {
    getPool().getConnection(function (err, connection) {
        dumpSchema(connection, true);
        console.log('Database cleaned!');
    });
}

/**
 * Dumps the database schema.
 */
function dumpSchema(connection, isPool) {
    console.log('Dumping schema...');
    var rl = readline.createInterface({
        input: fs.createReadStream(__dirname + '/config/schema_dump.sql')
    });

    rl.on('line', function (chunk) {
        connection.query(chunk.toString('ascii'), function (err, sets, fields) {
            if (err) console.log(err);
        });
    });

    rl.on('close', function () {
        isPool ? connection.release() : connection.end();
    });
}

module.exports = {
    clean,
    getPool,
    initialize
};