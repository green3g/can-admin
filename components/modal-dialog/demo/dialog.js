import 'can-admin/components/modal-dialog/modal-dialog';
import 'can-admin/components/confirm-dialog/confirm-dialog';

import stache from 'can-stache';
import DefineMap from 'can-define/map/map';

var render = stache(document.getElementById('demo-html').innerHTML);

var viewModel = new DefineMap({
    modal1: false,
    modal2: false,
    modal3: false,
    modal4: false,
    confirm1: false,
    onAccept () {
        console.log('----- Confirmation Accepted ------');
        console.log(arguments);
    },
    onReject () {
        console.log('----- Confirmation Rejected ------');
        console.log(arguments);
    },
    showModal (name) {
        this[name] = true;
    },
    hideModal (name) {
        this[name] = false;
    }
});

document.body.appendChild(render(viewModel));

window.DEMO_SOURCE = `
import 'can-admin/components/modal-dialog/modal-dialog';
import 'can-admin/components/modal-dialog/confirm-dialog';

import stache from 'can-stache';
import DefineMap from 'can-define/map/map';

var render = stache(document.getElementById('demo-html').innerHTML);

var viewModel = new DefineMap({
    modal1: false,
    modal2: false,
    modal3: false,
    confirm1: false,
    onAccept () {
        console.log('----- Confirmation Accepted ------');
        console.log(arguments);
    },
    onReject () {
        console.log('----- Confirmation Rejected ------');
        console.log(arguments);
    },
    showModal (name) {
        this[name] = true;
    },
    hideModal (name) {
        this[name] = false;
    }
});

document.body.appendChild(render(viewModel));
`
