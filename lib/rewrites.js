/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/package_list/packages'},
    {from: '/details/:id/:version', to: '_show/package_details/:id'},
    {from: '/details/:id', to: '_show/package_details/:id'},
    {from: '*', to: '_show/not_found'}
];
