var templates = require('duality/templates'),
    db = require('db'),
    duality = require('duality/core'),
    datelib = require('datelib'),
    gravatar = require('gravatar'),
    utils = require('./utils'),
    _ = require('underscore')._;


exports.addLatestUpdates = function (req, limit, el) {
    var q = {
        limit: 10,
        descending: true
    };
    var appdb = db.use(duality.getDBURL());
    appdb.getView('repository', 'packages_by_modified_time', q,
        function (err, data) {
            var rows = _.map(data.rows, function (row) {
                row.value.extra = datelib.prettify(row.value.time);
                return row;
            });
            $(el).html(
                templates.render('compact_package_list.html', req, {
                    rows: rows
                })
            );
        }
    );
};

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
                value: {
                    name: r.key,
                    extra: (r.value === 1) ?
                            r.value + ' package':
                            r.value + ' packages'
                }
            };
        });
        rows = rows.slice(0, limit);

        // get avatars
        var users = _.uniq(_.map(rows, function (r) {
            return 'org.couchdb.user:' + r.value.name;
        }));
        var userdb = db.use('/_users');
        var q = {
            keys: users,
            include_docs: true
        };
        userdb.allDocs(q, function (err, data) {
            var avatars = {};
            _.each(data.rows, function (row) {
                avatars[row.doc.name] = gravatar.avatarURL({
                    hash: row.doc.gravatar,
                    size: 32,
                    default_image: 'mm'
                });
            });

            // add avatars to rows
            rows = _.map(rows, function (r) {
                r.value.avatar = avatars[r.value.name];
                return r;
            });

            $(el).html(
                templates.render('compact_user_list.html', req, {
                    rows: rows
                })
            );
        });

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
