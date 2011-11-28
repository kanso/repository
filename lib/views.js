/**
 * Views to be exported from the design doc.
 */

exports.packages = {
    map: function (doc) {
        if (doc.type === 'package') {
            emit(doc.name,{
                name: doc.name,
                description: doc.description,
                modified: doc.time.modified
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
                description: doc.description,
                modified: doc.time.modified
            });
        }
    }
};

exports.package_dependents = {
    map: function (doc) {
        if (doc.type === 'package') {
            var latest = doc.versions[doc.tags.latest];
            var deps = latest.dependencies || {};
            for (var k in deps) {
                emit(k, 1);
            }
            emit(doc.name, 0);
        }
    },
    reduce: function (keys, values, rereduce) {
        return sum(values);
    }
};

exports.submittor_packages = {
    map: function (doc) {
        if (doc.type === 'package' && doc.submitted_by) {
            emit(doc.submitted_by, doc.name);
        }
    },
    reduce: function (keys, values, rereduce) {
        return values.length;
    }
};

exports.packages_by_category = {
    map: function (doc) {
        if (doc.type === 'package') {
            if (doc.categories && doc.categories.length) {
                for (var i = 0; i < doc.categories.length; i++) {
                    emit([doc.categories[i]], {
                        name: doc.name,
                        description: doc.description,
                        modified: doc.time.modified
                    });
                }
            }
            else {
                emit(['uncategorized'], {
                    name: doc.name,
                    description: doc.description,
                    modified: doc.time.modified
                });
            }
        }
    },
    reduce: function (keys, values, rereduce) {
        if (rereduce) {
            return sum(values);
        }
        return values.length;
    }
};
