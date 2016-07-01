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
import { ViewMap } from 'can-crud/crud-manager/ViewMap';
import 'can-ui/alert-widget/';
import PubSub from 'pubsub-js';


export let AppViewModel = can.Map.extend({
  define: {
    views: {
      Type: List.extend({
        map: ViewMap
      })
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
      value: null
    },
    sidebarHidden: {
      type: 'boolean',
      value: false
    },
    messages: {
      Value: List
    },
    deferreds: {
      Value: List
    }
  },
  startup: function(domNode) {
    this.initRoute();
    this.initPubSub();
    Promise.all(this.attr('deferreds')).then(() => {
      this.activateViewById(route.attr('view') || this.attr('views')[0].attr('id'));
      can.$(domNode).html(can.view(template, this));
    });
  },
  initRoute: function() {
    route(':view/:page/:objectId/');
    route.ready();
    this.attr(route.attr());

    //bind to properties that should update the route
    this.bind('objectId', this.updateRoute.bind(this, 'objectId'));
    this.bind('page', this.updateRoute.bind(this, 'page'));
    route.bind('change', this.routeChanged.bind(this));
  },
  initPubSub: function() {
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
  routeChanged: function() {
    this.attr(route.attr());
    if (this.attr('activeView.id') !== route.attr('view')) {
      this.activateViewById(route.attr('view'));
    }
  },
  toggleMenu: function(e) {
    this.attr('sidebarHidden', !this.attr('sidebarHidden'));
    return false;
  },
  activateViewById: function(name) {
    var self = this;
    this.attr('views').forEach(function(view) {
      if (view.attr('id') === name) {
        self.activateView(view);
      }
    });
  },
  activateView: function(view) {
    this.attr('activeView', view);
    if (route.attr('view') !== view.attr('id')) {
      route.attr('view', view.attr('id'));
    }
  },
  navigateToView: function(view) {
    can.batch.start();
    this.attr({
      page: 'all',
      objectId: 0
    });
    this.activateView(view);
    can.batch.stop();
    return false;
  },
  routeChange: function() {
    this.activateViewById(route.attr('view'));
  },
  updateRoute: function(name, action, value, oldValue) {
    if (!value) {
      route.attr(name, '');
    }
    route.attr(name, value);
  },
  getViewUrl(view) {
    return route.url({
      page: 'all',
      view: view.attr('id'),
      objectId: 0
    });
  },
  removeMessage: function(e) {
    var index = this.attr('messages').indexOf(e);
    var dummy = index !== -1 && this.attr('messages').splice(index, 1);
  }
});
