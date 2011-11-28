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

exports.addCategories = function (req, el) {
    var current_category = req.query.category;
    var appdb = db.use(duality.getDBURL());
    var q = {
        reduce: true,
        group_level: 1
    };
    appdb.getView('repository', 'packages_by_category', q, function (err, data) {
        var categories = _.map(data.rows, function (r) {
            return {
                key: r.key[0],
                name: utils.toSentenceCase(r.key[0]),
                count: r.value
            };
        });
        var total_packages = _.reduce(categories, function (count, c) {
            return count + c.count;
        }, 0);
        $(el).replaceWith(
            templates.render('category_list.html', req, {
                categories: categories,
                total_packages: total_packages,
                current_category: current_category
            })
        );
    });
};
