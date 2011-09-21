/**
 * Views to be exported from the design doc.
 */

exports.packages = {
    map: function (doc) {
        if (doc.type === 'package') {
            emit(doc.name, {description: doc.description});
        }
    }
};
