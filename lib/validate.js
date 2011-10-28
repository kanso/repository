/**
 * The validate_doc_update function to be exported from the design doc.
 */

var types = require('couchtypes/types'),
    app_types = require('./types'),
    comment_types = require('duality/contrib/comments/types');


module.exports = function (newDoc, oldDoc, userCtx) {
    types.validate_doc_update(app_types, newDoc, oldDoc, userCtx);
    types.validate_doc_update(comment_types, newDoc, oldDoc, userCtx);
};
