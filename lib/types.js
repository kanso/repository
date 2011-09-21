/**
 * Kanso document types to export
 */

var validators = require('kanso/validators'),
    permissions = require('kanso/permissions'),
    fields = require('kanso/fields'),
    Type = require('kanso/types').Type,
    rfields = require('./fields');


exports.package = new Type('package', {
    permissions: {
        add: permissions.loggedIn(),
        update: permissions.any([
            // TODO: add isAdmin to kanso/permissions module?
            permissions.hasRole('_admin'),
            permissions.usernameMatchesField('submitted_by'),
        ]),
        remove: permissions.any([
            permissions.hasRole('_admin'),
            permissions.usernameMatchesField('submitted_by')
        ])
    },
    fields: {
        _id: fields.string(),
        name: fields.string(),
        description: fields.string(),
        submitted_by: fields.creator(),
        website: fields.url({required: false}),

        // TODO: create objectArray field and add to kanso/fields module?
        maintainers: fields.array({
            required: false,
            parseEach: function (val) {
                return JSON.parse(val);
            },
            validators: [
                function (doc, val) {
                    for (var i = 0; i < val.length; i++) {
                        if (!val[i].name) {
                            throw new Error('Maintainer missing name');
                        }
                        if (typeof val[i].name !== 'string') {
                            throw new Error(
                                'Maintainer name should be a string'
                            );
                        }
                        if (val[i].website) {
                            validators.url()(doc, val[i].website);
                        }
                    }
                }
            ]
        }),

        time: rfields.times(),
        tags: rfields.tags(),
        versions: rfields.versions()

    },
    allow_extra_fields: true
});
