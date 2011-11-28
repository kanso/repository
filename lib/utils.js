var db = require('db'),
    duality = require('duality/core');


exports.totalPackages = function (callback) {
    var q = {
        limit: 0
    };
    var appdb = db.use(duality.getDBURL());
    appdb.getView('repository', 'packages', q, function (err, data) {
        callback(err, err ? undefined: data.total_rows);
    });
};

/**
 * Uppercase first letter
 */

exports.toSentenceCase = function (str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};
