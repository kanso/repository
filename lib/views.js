/**
 * Views to be exported from the design doc.
 */

exports.packages = {
    map: function (doc) {
        if (doc.type === 'package') {
            emit(doc.name, {
                name: doc.name,
                description: doc.description
            });
        }
    }
};

exports.packages_by_modified_time = {
    map: function (doc) {
        if (doc.type === 'package') {
            emit([doc.time.modified, doc.name], {
                name: doc.name,
                description: doc.description,
                time: doc.time.modified
            });
        }
    }
};

exports.packages_by_user = {
    map: function (doc) {
        if (doc.type === 'package') {
            emit([doc.submitted_by, doc.name], {
                name: doc.name,
                description: doc.description
            });
        }
    }
};
