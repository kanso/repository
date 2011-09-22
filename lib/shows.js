/**
 * Show functions to be exported from the design doc.
 */

var templates = require('kanso/templates'),
    _ = require('underscore')._;


exports.package_details = function (doc, req) {
    return {
        title: doc.name,
        content: templates.render('package_details.html', req, {
            doc: doc,
            dependency_list: _.keys(
                doc.versions[doc.tags.latest].dependencies || {}
            ),
            version_list: _.keys(doc.versions || {})
        })
    }
};

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};
