/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates'),
    events = require('kanso/events'),
    db = require('kanso/db'),
    datelib = require('./datelib'),
    _ = require('underscore')._;


exports.front_page = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        row.value.extra = datelib.prettify(row.value.time);
        rows.push(row);
    }

    events.once('afterResponse', function (info, req, res) {
        // most depended on
        var q = {reduce: true, group_level: 1};
        db.getView('package_dependents', q, function (err, data) {
            var rows = data.rows.sort(function (a, b) {
                return b.value - a.value;
            });
            rows = _.map(rows, function (r) {
                return {
                    key: r.key,
                    id: r.key,
                    value: {name: r.key, extra: r.value}
                };
            });
            rows = rows.slice(0, 10);
            $('#most_depended_on').html(
                templates.render('compact_package_list.html', req, {
                    rows: rows
                })
            );
        });

        // top submitters
        var q = {reduce: true, group_level: 1};
        db.getView('submittor_packages', q, function (err, data) {
            var rows = data.rows.sort(function (a, b) {
                return b.value - a.value;
            });
            rows = _.map(rows, function (r) {
                return {
                    key: r.key,
                    id: r.key,
                    value: {name: r.key, extra: r.value}
                };
            });
            rows = rows.slice(0, 10);
            $('#top_submitters').html(
                templates.render('compact_user_list.html', req, {
                    rows: rows
                })
            );
        });
    });

    return {
        title: 'Packages',
        content: templates.render('front_page.html', req, {
            rows: rows
        })
    };
};


exports.user_package_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        row.value.extra = 'Updated ' + datelib.prettify(row.value.modified);
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
