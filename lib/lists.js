/**
 * List functions to be exported from the design doc.
 */

var templates = require('duality/templates'),
    events = require('duality/events'),
    datelib = require('datelib'),
    utils = require('./utils'),
    ui = require('./ui'),
    _ = require('underscore')._;


exports.front_page = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var current_category = req.query.category;

    var row, categories = [];
    while (row = getRow()) {
        categories.push({
            key: row.key[0],
            name: utils.toSentenceCase(row.key[0]),
            count: row.value
        });
    }

    var total_packages = _.reduce(categories, function (count, c) {
        return count + c.count;
    }, 0);

    events.once('afterResponse', function (info, req, res) {
        ui.category_cache = categories;
        ui.addTopSubmitters(req, 10, '#top_submitters');
        ui.addLatestUpdates(req, 10, '#latest_updates');
        ui.addMostDependedOn(req, 10, '#most_depended_on');
        //ui.addCategories(req, '#categories');
    });

    return {
        title: 'Packages',
        content: templates.render('front_page.html', req, {
            categories: categories,
            total_packages: total_packages,
            current_category: current_category
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
    events.once('afterResponse', function (info, req, res) {
        ui.addCategories(req, '#categories');
    });
    return {
        title: req.query.name,
        content: templates.render('user_package_list.html', req, {
            rows: rows,
            name: req.query.name
        })
    };
};

exports.all_packages = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }
    var subheading = 'Complete list of packages in this repository';
    var s = req.query.sort;
    var sort_list = [
        {name: 'Alphabetical', link: '/all'},
        {name: 'Last updated', link: '/all/updated'},
        {name: 'Dependents', link: '/all/dependents'}
    ];
    if (s === 'alphabetical') {
        subheading = 'Complete list of packages sorted alphabetically';
        sort_list[0].active = true;
    }
    else if (s === 'updated') {
        subheading = 'Complete list of packages sorted by last update time';
        sort_list[1].active = true;
        rows = _.map(rows, function (r) {
            r.value.extra = datelib.prettify(r.value.time);
            return r;
        });
    }
    else if (s === 'dependents') {
        subheading = 'Complete list of packages sorted by number of dependents';
        sort_list[2].active = true;
        rows = rows.sort(function (a, b) {
            return b.value - a.value;
        });
        rows = _.map(rows, function (r) {
            return {
                key: r.key,
                id: r.key,
                value: {name: r.key, extra: r.value}
            };
        });
    }
    return {
        title: 'All packages',
        content: templates.render('all_packages.html', req, {
            rows: rows,
            sort_list: sort_list,
            subheading: subheading
        })
    };
};

exports.category_package_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        row.value.extra = 'Updated ' + datelib.prettify(row.value.modified);
        rows.push(row);
    }
    events.once('afterResponse', function (info, req, res) {
        ui.addCategories(req, '#categories');
    });
    return {
        title: utils.toSentenceCase(req.query.category),
        content: templates.render('category_package_list.html', req, {
            rows: rows,
            category: utils.toSentenceCase(req.query.category)
        })
    };
};
