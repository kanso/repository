var templates = require('kanso/templates'),
    db = require('kanso/db'),
    kanso_core = require('kanso/core'),
    utils = require('./utils'),
    _ = require('underscore')._;


exports.addMostDependedOn = function (req, limit, el) {
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
        $(el).html(
            templates.render('compact_package_list.html', req, {
                rows: rows
            })
        );
    });
};

exports.addTopSubmitters = function (req, limit, el) {
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
        var baseURL = kanso_core.getBaseURL();
        $(el).html(
            '<a href="' + baseURL + '/all">All packages (' + total + ')</a>'
        );
    });
};
