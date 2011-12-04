/**
 * Show functions to be exported from the design doc.
 */

var templates = require('duality/templates'),
    events = require('duality/events'),
    dutils = require('duality/utils'),
    semver = require('semver'),
    ui = require('./ui'),
    _ = require('underscore')._;


exports.package_details = function (doc, req) {
    var current = req.query.version || doc.tags.latest;

    var dependency_list = _.keys(
        doc.versions[current].dependencies || {}
    );
    var version_list = _.keys(doc.versions || {}).map(function (v) {
        return {version: v, active: v === current};
    });
    version_list = version_list.sort(semver.compare).reverse();
    var published_date = new Date(doc.time[current]).toString();

    var archive_basename = doc._id + '-' + current + '.tar.gz';
    var archive_url = dutils.getBaseURL(req) + '/_db/' + doc._id + '/' +
                      archive_basename;

    events.once('afterResponse', function (info, req, res) {
        ui.fetchREADME(doc, current);
    });

    return {
        title: doc.name,
        content: templates.render('package_details.html', req, {
            dependency_list: dependency_list,
            version_list: version_list,
            submitted_by: doc.submitted_by,
            published_date: published_date,
            cfg: doc.versions[current],
            archive_url: archive_url,
            archive_basename: archive_basename,
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
