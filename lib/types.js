/**
 * Kanso document types to export
 */

var validators = require('couchtypes/validators'),
    permissions = require('couchtypes/permissions'),
    fields = require('couchtypes/fields'),
    Type = require('couchtypes/types').Type,
    rfields = require('./fields');


exports.package = new Type('package', {
    permissions: {
        add: permissions.loggedIn(),
        update: permissions.any([
            // TODO: add isAdmin to kanso/permissions module?
            permissions.usernameMatchesField('submitted_by'),
            permissions.hasRole('_admin'),
            function (newDoc, oldDoc, newValue, oldValue, userCtx) {
                if (!oldDoc) throw new Error('No previous doc for maintainers');
                if (!oldDoc.maintainers) throw new Error('No maintainers provided');
                for (var i = 0, l = oldDoc.maintainers.length; i < l; i ++) {
                  if (oldDoc.maintainers[i].name === userCtx.name) return true
                }
                throw new Error('Username not in maintainers list');
            }
        ]),
        remove: permissions.any([
            permissions.usernameMatchesField('submitted_by'),
            permissions.hasRole('_admin'),
        ])
    },
    fields: {
        _id: fields.string(),
        name: fields.string(),
        description: fields.string(),
        submitted_by: fields.creator(),
        url: fields.url({required: false}),
        categories: fields.array({required: false}),

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
                        if (val[i].url) {
                            validators.url()(doc, val[i].url);
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
