import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';
import route from 'can-route';
import dev from 'can-util/js/dev/dev';
import 'can-stache/helpers/route';
import {TOPICS as T} from './constants';
import loader from '@loader';
import 'can-stache-bindings';

import PageMap from './types/PageMap';
import PageList from './types/PageList';
import renderBody from './templates/body.stache';
import header from './templates/header.stache';
import footer from './templates/footer.stache';
import error from './templates/error.stache';
import './styles.less';

window.route = route;


import '../config/base';

export const AppViewModel = DefineMap.extend('AppViewModel', {
    seal: false
}, {
    header: {
        serialize: false,
        value () {
            return header;
        }
    },
    error: {
        serialize: false,
        value () {
            return error;
        }
    },
    footer: {
        serialize: false,
        value () {
            return footer;
        }
    },
    routes: {
        serialize: false,
        Type: DefineList,
        value: ['{page}']
    },
    pages: {
        Type: PageList,
        serialize: false
    },
    pagePromise: {
        serialize: false,
        get () {
            const page = this.page;
            return new Promise((resolve, reject) => {
                const props = this.pages.byId(page);
                if (props.path) {
                    loader.import(props.path).then((module) => {
                        this.pageData.set(module.default);
                        resolve(module.default);
                    });
                } else {
                    dev.warn('app::page not in given pages array');
                    reject(new Error('Page not found'));
                }
            });
        }
    },
    page: {
        type: 'string',
        value: 'list',
        get (page) {
            return this.pages.isValid(page) ? page : this.pages[0].id;
        },
        set (page) {
            return page;
        },
        serialize (page) {
            return page;
        }
    },
    pageData: {
        value: {},
        Type: PageMap,
        serialize: false
    },
    /**
     * initializes the application and renders it on a dom node
     * @param  {DomElement} domNode The dom node to render this application
     */
    startup (domNode) {
        if (typeof domNode === 'string') {
            domNode = document.querySelector(domNode);
            if (!domNode) {
                throw new Error('app::could not locate domnode');
            }
        }


        // init routes
        const routes = this.routes;
        if (routes.length) {
            route.data = this;
            routes.forEach((r) => {
                route(r);
            });
            route.ready();
        }
            
        domNode.appendChild(renderBody(this));
    }
});
