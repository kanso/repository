var templates = require('duality/templates'),
    db = require('db'),
    duality = require('duality/core'),
    datelib = require('datelib'),
    gravatar = require('gravatar'),
    sanitize = require('sanitize'),
    showdown = require('./showdown-wiki'),
    path = require('path'),
    utils = require('./utils'),
    _ = require('underscore')._;


/**
 * used for caching the categories list to reduce flash of content in the
 * sidebar while waiting for the category view to load
 */

exports.category_cache = null;


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
    if (exports.category_cache) {
        var categories = exports.category_cache;
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
    }
    appdb.getView('repository', 'packages_by_category', q, function (err, data) {
        var categories = _.map(data.rows, function (r) {
            return {
                key: r.key[0],
                name: utils.toSentenceCase(r.key[0]),
                count: r.value
            };
        });
        if (JSON.stringify(categories) !== JSON.stringify(exports.category_cache)) {
            ui.category_cache = categories;
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
        }
    });
};


exports.fetchREADME = function (doc, version) {
    console.log('fetching ' + version);
    var att;
    var dir = 'docs/' + version + '/';
    for (var k in doc._attachments) {
        if (k.substr(0, dir.length) === dir) {
            att = k;
        }
    }
    console.log('matched ' + att);
    var ext = path.extname(att);

    var pre = $('<pre class="data"></pre>');
    if (att) {
        $('#readme').prepend(
            '<h4>' + sanitize.h(path.basename(att)) + '</h4>'
        );
        var dbURL = duality.getDBURL();
        $.get(dbURL + '/' + encodeURIComponent(doc._id) + '/' + att,
            function (data) {
                if (ext === '.md' || ext === '.markdown') {
                    var html = showdown.convert(data);
                    $('#readme').append('<div class="data">' + html + '</div>');
                }
                else {
                    $('#readme').append(pre.text(data));
                }
            }
        );
    }
    else {
        $('#readme').append(
            pre.text('This package has no README')
        );
    }
};
