/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');


exports.package_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }
    return {
        title: 'Packages',
        content: templates.render('package_list.html', req, {
            rows: rows
        })
    };
};

exports.user_package_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }
    return {
        title: req.query.name,
        content: templates.render('user_package_list.html', req, {
            rows: rows,
            name: req.query.name
        })
    };
};
