/**
 * Show functions to be exported from the design doc.
 */

var templates = require('duality/templates'),
    events = require('duality/events'),
    comments = require('duality/contrib/comments/comments'),
    _ = require('underscore')._;


exports.package_details = function (doc, req) {
    var current = req.query.version || doc.tags.latest;

    var dependency_list = _.keys(
        doc.versions[current].dependencies || {}
    );
    var version_list = _.keys(doc.versions || {}).map(function (v) {
        return {version: v, active: v === current};
    });

    var published_date = new Date(doc.time[current]).toString();

    events.once('afterResponse', function (info, req, res) {
        comments.addToPage(req, doc._id, {
            user_link: '{baseURL}/user/{user|uc}',
            monospace: true,
            descending: true
        });
    });

    return {
        title: doc.name,
        content: templates.render('package_details.html', req, {
            comments_target: doc._id,
            dependency_list: dependency_list,
            version_list: version_list,
            submitted_by: doc.submitted_by,
            published_date: published_date,
            cfg: doc.versions[current],
            doc: doc
        })
    }
};

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};
