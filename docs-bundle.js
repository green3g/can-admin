var stealTools = require('steal-tools');
var path = require('path');

stealTools.build({
    main: 'can-admin/docs-main',
    config: path.join(__dirname, 'package.json!npm'),
    bundle: [
        'can-admin/components/dropdown-menu/demo/dropdown',
        'can-admin/components/filter-widget/demo/filter',
        'can-admin/components/data-admin/demo/admin',
        'can-admin/components/form-widget/demo/form',
        'can-admin/components/list-table/demo/listTable',
        'can-admin/components/modal-dialog/demo/dialog',
        'can-admin/components/nav-container/demo/nav',
        'can-admin/components/paginate-widget/demo/paginate',
        'can-admin/components/property-table/demo/propertyTable',
        'can-admin/components/toast-container/demo/toast'
    ]
}, {
    removeDevelopmentCode: false,
    bundleSteal: false,
    bundleAssets: true,
    sourceMaps: true,
    dest: 'docs/can-admin'
});
