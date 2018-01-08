
import Component from 'can-component';
import template from './template.stache!';
import ViewModel from './ViewModel';
import './widget.less!';

import '../admin-paginate/admin-paginate';
import '../search-control/search-control';
import '../manage-toolbar/manage-toolbar';
import 'can-admin/components/dropdown-menu/dropdown-menu';
import 'can-admin/components/list-table/list-table';
import 'can-admin/components/property-table/property-table';
import 'can-admin/components/form-widget/form-widget';
import 'can-admin/components/nav-container/nav-container';
import 'can-admin/components/nav-page/nav-page';
import 'can-admin/components/confirm-dialog/confirm-dialog';
import 'can-admin/components/modal-dialog/modal-dialog';

export default Component.extend({
    tag: 'admin-crud',
    ViewModel: ViewModel,
    view: template,
    events: {
        '{viewModel.parameters.filters} length': function () {
            this.viewModel.parameters.page = 0;
        },
        '{viewModel.parameters} perPage': function () {
            this.viewModel.parameters.page = 0;
        }
    }
});
