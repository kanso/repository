/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates'),
    events = require('kanso/events'),
    comments = require('app-comments/comments'),
    datelib = require('datelib'),
    ui = require('./ui'),
    _ = require('underscore')._;


exports.front_page = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var row, rows = [];
    while (row = getRow()) {
        row.value.extra = datelib.prettify(row.value.time);
        rows.push(row);
    }
    events.once('afterResponse', function (info, req, res) {
        ui.addMostDependedOn(req, 10, '#most_depended_on');
        ui.addTopSubmitters(req, 10, '#top_submitters');
        ui.addTotalPackages(req, '#total_packages');
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
    events.once('afterResponse', function (info, req, res) {
        comments.addUserCommentsToPage(req, req.query.name, {
            user_link: '{baseURL}/user/{user|uc}',
            target_link: '{baseURL}/details/{target|uc}',
            monospace: true
        });
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
