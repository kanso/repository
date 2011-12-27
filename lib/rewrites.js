/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/front_page/packages_by_category', query: {
        reduce: 'true',
        group_level: '1'
    }},
    {from: '/details/:id/:version', to: '_show/package_details/:id'},
    {from: '/details/:id', to: '_show/package_details/:id'},
    {
        from: '/user/:name',
        to: '_list/user_page/packages_by_user',
        query: {
            startkey: [':name'],
            endkey: [':name', {}],
            sort: 'alphabetical'
        }
    },
    {
        from: '/category/:category',
        to: '_list/category_page/packages_by_category',
        query: {
            startkey: [':category'],
            endkey: [':category', {}],
            reduce: 'false',
            sort: 'alphabetical'
        }
    },
    {
        from: '/all',
        to: '_list/category_page/packages',
        query: {
            sort: 'alphabetical',
            category: 'all'
        }
    },
    {from: '*', to: '_show/not_found'}
];
