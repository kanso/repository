var Field = require('kanso/fields').Field,
    _ = require('underscore')._;


function objectField(options, validator) {
    options.validators = options.validators || [];
    options.validators.unshift(validator);
    return new Field(_.defaults((options || {}), {
        parse: function (raw) {
            return JSON.parse(raw);
        }
    }));
};


exports.times = function (options) {
    return objectField(function (doc, val) {
        for (var k in val) {
            if (isNaN(Date.parse(val[k]))) {
                throw new Error('Invalid date string for ' + k);
            }
        }
    });
};

exports.tags = function (options) {
    return objectField(function (doc, val) {
        for (var k in val) {
            if (!(val[k] in doc.versions)) {
                throw new Error(k + ' tag points to missing version number');
            }
        }
    });
};

exports.versions = function (options) {
    return objectField(function (doc, val) {
        for (var k in val) {
            if (!val[k]) {
                throw new Error(
                    'Version information should be an object not ' + val[k]
                );
            }
            if (!val[k].name) {
                throw new Error('Version information missing name');
            }
            if (!val[k].version) {
                throw new Error('Version information missing version number');
            }
            if (!val[k].description) {
                throw new Error('Version information missing description');
            }
        }
    });
};


