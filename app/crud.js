import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';
import assign from 'can-util/js/assign/assign';
import route from 'can-route';
import dev from 'can-util/js/dev/dev';
import 'can-stache/helpers/route';
import PubSub from 'pubsub-js';
import {TOPICS as T} from './constants';
import Toast from 'can-admin/components/toast-item/ViewModel';
import steal from '@loader';
import 'can-stache-bindings';

import template from './crud.stache!';
import './crud.less';

import '../config/base';

export const AppViewModel = DefineMap.extend('AppViewModel', {
    seal: false
}, {
    title: {serialize: false, type: 'string'},
    iconClass: {type: 'string', serialize: false},
    page: {
        type: 'string',
        value: 'list'
    },
    objectId: {
        type: 'number',
        value: 0,
        serialize (val) {
            return this.page !== 'list' && val ? val : undefined;
        }
    },
    view: {
        type: 'string',
        set (view) {
            const validViews = Object.keys(this.views);
            if (!view || validViews.indexOf(view) === -1) {
                if (!this.views) {
                    view = null;
                } else {
                    view = validViews[0];
                }
            }
            return view;
        }
    },
    views: {
        Type: DefineMap.extend({
            seal: false
        }),
        serialize: false
    },
    activeViewProps: {
        get (view) {
            if (!this.view) {
                view = null;
            } else {
                view = this.views[this.view];
            }
            return view;
        },
        serialize: false
    },
    configPromise: {
        get () {
            const view = this.activeViewProps;
            if (!view) {
                return null;
            }
            const promise = new Promise((resolve, reject) => {
                steal.import(view.path).then((module) => {
                    let viewMod = module[view.module || 'default'];
                    const name = this.view;

                    //check for route parameters passed to filter this view
                    const params = this.hasOwnProperty('name') ? this[name].parameters : null;
                    if (params) {
                        viewMod = assign({}, viewMod, {
                            parameters: params
                        });
                    }
                    resolve(viewMod);
                }, reject);
            });
            promise.catch((e) => {
                dev.warn(e);
            });
            return promise;
        },
        serialize: false
    },
    config: {
        Type: DefineMap,
        get (val, set) {
            this.configPromise.then(set);
        }
    },
    sidebarActive: {
        type: 'boolean',
        value: false,
        serialize: false
    },
    messages: {
        Value: DefineList.extend({
            '#': Toast
        }),
        serialize: false
    },
    defaultIconClass: {
        type: 'string',
        value: 'fa fa-plus-circle',
        serialize: false
    },
    defaults: {
        Value: DefineMap,
        Type: DefineMap,
        serialize: false
    },
    parameters: {
        Type: DefineMap,
        serialize: false,
        set (params) {
            // console.log(params);
            // if (!params) {
            //     return null;
            // }
            // if (!this.viewObject) {
            //     return null;
            // }
            // this.viewObject.parameters.set(params.serialize());
            return params;
        }
    },
    /**
     * initializes the application and renders it on a dom node
     * @param  {DomElement} domNode The dom node to render this application
     */
    startup (domNode) {
        if (typeof domNode === 'string') {
            domNode = document.querySelector(domNode);
            if (!domNode) {
                throw new Error('Could not locate domnode');
            }
        }
        this.initRoute();
        this.initPubSub();
        domNode.appendChild(template(this));
    },
    /**
     * initializes the route url
     */
    initRoute () {
        route.data = this;
        route('{view}/{page}');
        route('{view}/{page}/{objectId}');
        route.ready();

        //set default view if its not set already
        const key = route.data.view || this.view;
        this.view = key;
    },
    /**
     * initializes the message listener using pubsub-js
     */
    initPubSub () {
        PubSub.subscribe(T.ADD_TOAST, (topic, toast) => {
            this.messages.push(toast);
        });
        PubSub.subscribe(T.SET_VIEW, (topic, view, page, id) => {
            this.assign({
                view: view,
                objectId: id || null,
                page: page || 'list'
            });
        });
    },
    toggleSidebar () {
        this.sidebarActive = !this.sidebarActive;
    }
});
