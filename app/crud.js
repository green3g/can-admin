import can from 'can/util/library';
import CanMap from 'can/map/';
import List from 'can/list/';
import route from 'can/route/';
import 'can/view/stache/';
import 'can/map/define/';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css!';
import 'bootstrap/dist/css/bootstrap-theme.min.css!';
import 'font-awesome/css/font-awesome.min.css';
import './crud.less!';
import template from './crud.stache!';
import { TOPICS } from 'can-crud/crud-manager/';
import 'can-ui/alert-widget/';
import PubSub from 'pubsub-js';


export let AppViewModel = can.Map.extend({
  define: {
    views: {
      Type: CanMap,
      serialize: false
    },
    page: {
      type: 'string',
      value: 'all'
    },
    objectId: {
      type: 'number',
      value: 0
    },
    activeView: {
      value: null,
      type: 'string'
    },
    activeViewProps: {
      get(){
        if (!this.attr('activeView')) {
          return null;
        }
        return this.attr('views.' + this.attr('activeView'));
      }
    },
    activeViewConfig: {
      get(val, setAttr) {
        let view = this.attr('activeViewProps');
        if (!view) {
          return null;
        }
        let deferred = can.Deferred();
        System.import(view.attr('path')).then(module => {
          deferred.resolve(module[view.attr('moduleID') || 'default']);
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
      Value: List,
      serialize: false
    },
    defaultIconClass: {
      type: 'string',
      value: 'fa fa-plus-circle',
      serialize: false
    }
  },
  startup(domNode) {
    if (!this.attr('activeView')) {
      let key = CanMap.keys(this.attr('views'))[0];
      this.attr('activeView', key);
    }
    this.initRoute();
    this.initPubSub();
    can.$(domNode).html(can.view(template, this));
  },
  initRoute() {
    route.map(this);
    route(':activeView/:page/:objectId');
    route.ready();
  },
  initPubSub() {
    PubSub.subscribe(TOPICS.ADD_MESSAGE, (topic, message) => {
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
      activeView: view,
      page: 'all',
      objectId: 0
    });
  },
  removeMessage: function(e) {
    var index = this.attr('messages').indexOf(e);
    var dummy = index !== -1 && this.attr('messages').splice(index, 1);
  }
});
