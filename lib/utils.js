var db = require('kanso/db');


exports.totalPackages = function (callback) {
    var q = {
        limit: 0
    };
    db.getView('packages', q, function (err, data) {
        callback(err, err ? undefined: data.total_rows);
    });
};
