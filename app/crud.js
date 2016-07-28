import can from 'can/util/library';
import CanMap from 'can/map/';
import route from 'can/route/';
import 'can/view/stache/';
import 'can/map/define/';
import PubSub from 'pubsub-js';

import './crud.less!';
import template from './crud.stache!';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css!';
import 'font-awesome/css/font-awesome.min.css!';
import 'can-crud/crud-manager/';
import 'can-ui/alert-widget/alert-widget';
import { TOPICS } from 'can-crud/crud-manager/';
import { MessageList } from 'can-ui/alert-widget/alert-widget';
import { Message } from 'can-ui/alert-widget/message';

export let AppViewModel = CanMap.extend({
  define: {
    page: {
      type: 'string',
      value: 'list',
      set(page) {
        let validPages = ['list', 'details', 'add', 'edit', 'selection', 'loading'];
        if (!page || validPages.indexOf(page) === -1) {
          page = validPages[0];
        }
        this.updateTitle(this.attr('activeViewProps'), page);
        return page;
      }
    },
    objectId: {
      type: 'number',
      value: 0
    },
    view: {
      type: 'string',
      set(view) {
        let validViews = CanMap.keys(this.attr('views'));
        if (!view || validViews.indexOf(view) === -1) {
          if (!this.attr('views')) {
            view = null;
          } else {
            view = validViews[0];
          }
        }
        return view;
      }
    },
    views: {
      Type: CanMap,
      serialize: false
    },
    activeViewProps: {
      get(view) {
        if (!this.attr('view')) {
          view = null;
        } else {
          view = this.attr('views.' + this.attr('view'));
        }
        this.updateTitle(view, this.attr('page'));
        return view;
      },
      serialize: false
    },
    activeViewConfig: {
      get(val, setAttr) {
        let view = this.attr('activeViewProps');
        if (!view) {
          return null;
        }
        let deferred = can.Deferred();
        System.import(view.attr('path')).then(module => {
          let viewMod = module[view.attr('module') || 'default'];
          let name = this.attr('view');

          //check for route parameters passed to filter this view
          let params = route.attr(name + '.parameters');
          if (params) {
            viewMod = can.extend({}, viewMod, { parameters: params });
          }
          deferred.resolve(viewMod);
        });
        return deferred;
      },
      serialize: false
    },
    sidebarHidden: {
      type: 'boolean',
      value: false,
      serialize: false
    },
    messages: {
      Value: MessageList,
      serialize: false
    },
    defaultIconClass: {
      type: 'string',
      value: 'fa fa-plus-circle',
      serialize: false
    }
  },
  /**
   * initializes the application and renders it on a dom node
   * @param  {DomElement} domNode The dom node or selector to render this application
   */
  startup(domNode) {
    this.initRoute();
    this.initPubSub();
    can.$(domNode).html(can.view(template, this));
  },
  /**
   * initializes the route url
   */
  initRoute() {
    route.map(this);
    route(':view/:page/:objectId');
    route.ready();

    //set default view if its not set already
    let key = route.attr('view') || this.attr('view');
    this.attr('view', key);
  },
  /**
   * initializes the message listener using pubsub-js
   */
  initPubSub() {
    PubSub.subscribe(TOPICS.ADD_MESSAGE, (topic, message) => {
      message = new Message(message);
      this.attr('messages').push(message);

      if (message.autoHide) {
        setTimeout(() => {
          this.removeMessage(message);
        }, message.timeout);
      }
    });

    PubSub.subscribe(TOPICS.CLEAR_MESSAGES, (topic, data) => {
      this.attr('messages').replace([]);
    });
  },
  /**
   * updates the title of the page when the view changes
   * @param  {activeViewProps} view The properties describing the view. The title
   * property of this object is used as part of the page title
   * @param  {String} page The name of the current page, this is capitalized
   * and added to the title of the page
   */
  updateTitle(view, page) {
    let node = can.$('title');
    let dummy = view && page && node.length && node.html && node.html(view.title + ' - ' + can.capitalize(page));
  },
  /**
   * Toggles the display of the sidebar mode via `sidebarHidden` property.
   *  Sidebar will become compact or full.
   * @return {Boolean} Returns false to prevent page navigation from link click
   */
  toggleMenu() {
    this.attr('sidebarHidden', !this.attr('sidebarHidden'));
    return false;
  },
  /**
   * Returns a can-route url based on a view id
   * @param  {string} view The id of the view
   * @return {[type]}      [description]
   */
  getViewUrl(view) {
    return route.url({
      view: view,
      page: 'list',
      objectId: 0
    });
  },
  removeMessage: function(e) {
    var index = this.attr('messages').indexOf(e);
    var dummy = index !== -1 && this.attr('messages').splice(index, 1);
  }
});
