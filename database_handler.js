var fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

module.exports = function (config) {

    const sqliteDbLocation = './db.db';

// check if db exists
var exists = fs.existsSync(sqliteDbLocation);

// create blank db file if it doesn't exist
if (!exists) {
    console.log("Creating DB file.");
    fs.openSync(sqliteDbLocation, "w");
}

// new db object
   var db = new sqlite3.Database(sqliteDbLocation);

// if no database exists, create initial tables

db.run('CREATE TABLE IF NOT EXISTS highscore\
    (   id TEXT PRIMARY KEY,\
        nickname TEXT,\
        score INTEGER NOT NULL\
    );');

return db;
};