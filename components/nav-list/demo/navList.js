import 'can-admin/components/nav-list/nav-list';
import stache from 'can-stache';
import DefineMap from 'can-define/map/map';

var render = stache(document.getElementById('demo-html').innerHTML);

var viewModel = new DefineMap({
    pages: [{
        label: 'List'
    }, {
        label: 'Create',
        active: true
    }, {
        label: 'Other Options'
    }]
});

document.body.appendChild(render(viewModel));

window.DEMO_SOURCE = `
import 'can-admin/components/nav-list/nav-list';
import stache from 'can-stache';
import DefineMap from 'can-define/map/map';

var render = stache(document.getElementById('demo-html').innerHTML);

var viewModel = new DefineMap({
    pages: [{
        label: 'List'
    }, {
        label: 'Create',
        active: true
    }, {
        label: 'Other Options'
    }]
});

document.body.appendChild(render(viewModel));

`
