var templates = require('duality/templates'),
    db = require('db'),
    duality = require('duality/core'),
    datelib = require('datelib'),
    gravatar = require('gravatar'),
    sanitize = require('sanitize'),
    showdown = require('./showdown-wiki'),
    users = require('users'),
    path = require('path'),
    utils = require('./utils'),
    _ = require('underscore')._;


/**
 * used for caching the categories list to reduce flash of content in the
 * sidebar while waiting for the category view to load
 */

exports.category_cache = null;



/**
 * Extends rows with row.value.avatar by fetching user documents and
 * getting gravatar url
 *
 * @param {Array} rows
 * @param {Function} iterator - accepts a row and returns the user to get
 * @param {Function} callback
 */

exports._avatar_cache = {};

exports.getAvatars = function (rows, iterator, callback) {
    console.log(['getAvatars', rows]);
    console.log(['_avatar_cache', exports._avatar_cache]);
    var checkrows = rows.slice();

    // check cached avatars
    var avatars = {};
    _.each(checkrows, function (r, i) {
        if (exports._avatar_cache[iterator(r)]) {
            avatars[iterator(r)] = exports._avatar_cache[iterator(r)];
            checkrows.splice(i, 1);
        }
    });

    // get avatars
    var users = _.uniq(_.map(checkrows, function (r) {
        return 'org.couchdb.user:' + iterator(r);
    }));

    // everything already cached
    if (!users.length) {
        console.log('everything already cached');
        // add avatars to rows
        rows = _.map(rows, function (r) {
            r.value.avatar = avatars[iterator(r)];
            return r;
        });
        console.log(['getAvatars result', rows]);
        return callback(null, rows);
    }

    var userdb = db.use('/_users');
    var q = {
        keys: users,
        include_docs: true
    };
    userdb.allDocs(q, function (err, data) {
        if (err) {
            console.log(['getAvatars error', err]);
            return callback(err);
        }
        _.each(data.rows, function (row) {
            if (row.error !== 'not_found') {
                avatars[row.doc.name] = gravatar.avatarURL({
                    hash: row.doc.gravatar,
                    size: 32,
                    default_image: 'mm'
                });
            }
        });
        // add avatars to rows
        rows = _.map(rows, function (r) {
            r.value.avatar = avatars[iterator(r)];
            return r;
        });
        console.log(['extending _avatar_cache', exports._avatar_cache, avatars]);
        exports._avatar_cache = _.extend(exports._avatar_cache, avatars);
        console.log(['getAvatars result', rows]);
        return callback(null, rows);
    });
};


exports.addLatestUpdates = function (req, limit, el) {
    var q = {
        limit: 10,
        descending: true
    };
    var appdb = db.use(duality.getDBURL());
    appdb.getView('repository', 'packages_by_modified_time', q,
        function (err, data) {
            var rows = _.map(data.rows, function (row) {
                row.value.user = row.value.submitted_by;
                row.value.extra = datelib.prettify(row.value.time.modified);
                if (row.value.time.modified === row.value.time.created) {
                    row.value.action = 'created';
                }
                else {
                    row.value.action = 'updated';
                }
                return row;
            });
            exports.getAvatars(rows,
                function (r) {
                    return r.value.user;
                },
                function (err, rows) {
                    $(el).html(
                        templates.render('repository_list.html', req, {
                            rows: rows
                        })
                    );
                }
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
                value: {name: r.key, extra: r.value + ' packages'}
            };
        });
        rows = rows.slice(0, 10);

        $(el).html(
            templates.render('repository_list.html', req, {
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
                    user: r.key,
                    extra: (r.value === 1) ?
                            r.value + ' package':
                            r.value + ' packages'
                }
            };
        });
        rows = rows.slice(0, limit);

        exports.getAvatars(rows,
            function (r) {
                return r.value.user;
            },
            function (err, rows) {
                $(el).html(
                    templates.render('repository_list.html', req, {
                        rows: rows
                    })
                );
            }
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
            exports.category_cache = categories;
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
    var att;
    var dir = 'docs/' + version + '/';
    for (var k in doc._attachments) {
        if (k.substr(0, dir.length) === dir) {
            att = k;
        }
    }

    var pre = $('<pre class="data"></pre>');
    if (att) {
        $('#readme').prepend(
            '<h4>' + sanitize.h(path.basename(att)) + '</h4>'
        );
        var dbURL = duality.getDBURL();
        $.get(dbURL + '/' + encodeURIComponent(doc._id) + '/' + att,
            function (data) {
                var ext = path.extname(att);
                if (ext === '.md' || ext === '.markdown') {
                    var html = showdown.convert(data);
                    $('#readme').append('<div class="data">' + html + '</div>');
                    exports.syntaxHighlight();
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

/**
 * Add syntax highlighting to the page using highlight.js (hljs)
 */

exports.syntaxHighlight = function () {
    $('pre > code').each(function () {
        if (this.className) {
            // has a code class
            $(this).html(hljs.highlight(this.className, $(this).text()).value);
        }
    });
};


// TODO: change this to use a table like table.package_details instead of
// overwriting the subtitle

// Adds user website link and avatar on user packages page
exports.addUserWebsite = function (req) {
    users.get(req.query.name, function (err, doc) {
        if (err) {
            // don't thow errors, this isn't important
            console.error(err);
            return;
        }
        if (doc.website) {
            // only replace existing text if user has set a website
            var a = $('<a>' + doc.website + '</a>').attr({href: doc.website});
            var tr = $('<tr><th>Website</th><td class="website"></td></tr>');
            $('#user_details table.details tbody').append(tr);
            $('#user_details table td.website').html(a);
        }
    });
};
