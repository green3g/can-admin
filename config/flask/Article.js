import CanMap from 'can/map/';
import Factory from 'can-restless';
import route from 'can/route/';

import pubsub from 'pubsub-js';
import { TOPICS } from 'can-crud/crud-manager/';



/*
id = db.Column(db.Integer, primary_key=True)
author_id = db.Column(db.Integer, db.ForeignKey('person.id'))
author = db.relationship(Person, backref=db.backref('articles'))
title = db.Column(db.String(100))
content = db.Column(db.Text())
*/

export let Article = Factory({
  url: '/api/article',
  name: 'article',
  map: CanMap.extend({
    define: {
      author_id: {
        type: 'number',
        formatter(id) {
          return '<a  href="' +
            route.url({
              view: 'people_basic',
              page: 'details',
              objectId: id
            }) + '">Author: ' + id + '</a>';
        }
      },
      title: {
        type: 'string'
      },
      content: {
        type: 'string',
        excludeListTable: true,
        properties: {
          textarea: true
        }
      },
      author: {
        serialize: false,
        excludeListTable: true,
        excludePropertyTable: true,
        excludeForm: true,
        excludeFilter: true,
        set(val) {
          this.attr('author_id', val);
          return val;
        }
      },
      reviewed: {
        //sqlite doesn't have boolean so we use 1,0
        type: 'integer',
        value: 0,
        formatter(reviewed) {
          return '<i class="fa fa-' +
            (reviewed ? 'check' : 'square-o') +
            '"></i>';
        },
        fieldType: 'select',
        properties: {
          options: [{
            label: 'Yes',
            value: 1
          }, {
            label: 'No',
            value: 0
          }]
        }
      }
    }
  })
});

export default {
  connection: Article,
  title: 'Article',
  manageButtons: [{
    iconClass: 'fa fa-check',
    buttonClass: 'success',
    text: 'Mark Reviewed',
    onClick(items) {
      items.forEach(i => {
        i.attr('reviewed', 1);
        Article.save(i).then(() => {
          pubsub.publish(TOPICS.ADD_MESSAGE, {
            message: 'Item saved: ',
            detail: 'ID: ' + i.attr('id')
          });
        });
      });
    }
  }]
};
