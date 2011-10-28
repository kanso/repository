var templates = require('duality/templates'),
    db = require('db'),
    duality = require('duality/core'),
    utils = require('./utils'),
    _ = require('underscore')._;


exports.addMostDependedOn = function (req, limit, el) {
    var q = {reduce: true, group_level: 1};
    var appdb = db.use(duality.getDBURL());
    appdb.getView('repository', 'package_dependents', q, function (err, data) {
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
        $(el).html(
            templates.render('compact_package_list.html', req, {
                rows: rows
            })
        );
    });
};

exports.addTopSubmitters = function (req, limit, el) {
    var q = {reduce: true, group_level: 1};
    var appdb = db.use(duality.getDBURL());
    appdb.getView('repository', 'submittor_packages', q, function (err, data) {
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
        rows = rows.slice(0, limit);
        $(el).html(
            templates.render('compact_user_list.html', req, {
                rows: rows
            })
        );
    });
};

exports.addTotalPackages = function (req, el) {
    utils.totalPackages(function (err, total) {
        var baseURL = duality.getBaseURL();
        $(el).html(
            '<a href="' + baseURL + '/all">All packages (' + total + ')</a>'
        );
    });
};
