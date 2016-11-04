import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';
import canViewModel from 'can-view-model';
import assign from 'can-util/js/assign/assign';
import route from 'can-route';
import PubSub from 'pubsub-js';
window.vm = canViewModel;

import 'font-awesome/css/font-awesome.css!';
import 'spectre.css/dist/spectre.css!';
import './crud.less!';
import template from './crud.stache!';

import 'spectre-canjs/data-admin/data-admin';
import 'spectre-canjs/toast-container/toast-container';

export const AppViewModel = DefineMap.extend('AppViewModel', {
    page: {
        type: 'string',
        value: 'list',
        set (page) {
            const validPages = ['list', 'details', 'add', 'edit'];
            if (!page || validPages.indexOf(page) === -1) {
                page = validPages[0];
            }
            return page;
        }
    },
    objectId: {
        type: 'number',
        value: 0
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
        Type: DefineMap,
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
        get (val) {
            const view = this.activeViewProps;
            if (!view) {
                return null;
            }
            const promise = new Promise((resolve, reject) => {
                System.import(view.path).then((module) => {
                    let viewMod = module[view.module || 'default'];
                    const name = this.view;

                    //check for route parameters passed to filter this view
                    const params = this.hasOwnProperty('name') ? this[name].parameters : null;
                    if (params) {
                        viewMod = assign({}, viewMod, {parameters: params});
                    }
                    resolve(viewMod);
                }, reject);
            });
            promise.catch((e) => {
                console.error(e);
            });
            return promise;
        },
        serialize: false
    },
    config: {
        get (val, set) {
            this.configPromise.then(set);
        }
    },
    sidebarHidden: {
        type: 'boolean',
        value: false,
        serialize: false
    },
    messages: {
        Value: DefineList,
        serialize: false
    },
    defaultIconClass: {
        type: 'string',
        value: 'fa fa-plus-circle',
        serialize: false
    },
    topics: {
        value: {
            addMessage: 'addMessage',
            setView: 'setView'
        },
        serialize: false
    },
  /**
   * initializes the application and renders it on a dom node
   * @param  {DomElement} domNode The dom node or selector to render this application
   */
    startup (domNode) {
        this.initRoute();
        this.initPubSub();
        domNode.appendChild(template(this));
        this.toastContainer = canViewModel('toast-container');
    },
  /**
   * initializes the route url
   */
    initRoute () {
        route.data = this;
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
        PubSub.subscribe(this.topics.addMessage, (topic, message) => {
            this.toastContainer.addMessage(message);
        });
        PubSub.subscribe(this.topics.setView, (topic, view, page, id) => {
            this.set({
                view: view,
                objectId: id || null,
                page: page || 'list'
            });
        });
    }
});
