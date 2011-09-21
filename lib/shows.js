/**
 * Show functions to be exported from the design doc.
 */

var templates = require('kanso/templates');


exports.package_details = function (doc, req) {
    return {
        title: doc.name,
        content: templates.render('package_details.html', req, {doc: doc})
    }
};

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};
