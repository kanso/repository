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
