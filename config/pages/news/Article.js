import DefineMap from 'can-define/map/map';
import factory from 'can-admin/behaviors/flask-restless/index';
import {Person} from './Person_Basic';
import {Visit} from './Visit';

// import pubsub from 'pubsub-js';
// import {TOPICS} from 'can-crud/crud-manager/';


/*
id = db.Column(db.Integer, primary_key=True)
author_id = db.Column(db.Integer, db.ForeignKey('person.id'))
author = db.relationship(Person, backref=db.backref('articles'))
title = db.Column(db.String(100))
content = db.Column(db.Text())
*/

export const Article = factory({
    // behaviors: [connect.behavior('logvisit', (base) => {
    //     return {
    //         getData (params) {
    //             new Visit.Map({
    //                 article_id: params.id
    //             }).save();
    //             return base.getData.apply(this, arguments);
    //         }
    //     };
    // })],
    url: '/api/article',
    name: 'article',
    Map: DefineMap.extend({
        // eslint-disable-next-line camelcase
        id: 'string',
        author_id: {
            list: false,
            type: 'number',
            fieldType: 'select',
            optionsPromise: new Promise((resolve, reject) => {
                Person.getList().then((data) => {
                    resolve(data.map((person) => {
                        return {
                            label: person.name,
                            value: person.id
                        };
                    }));
                });
            })
        },
        title: {
            displayTemplate: `<a href="{{routeUrl(section='details' objectId=object.id, true)}}">
                <i class="fa fa-list"></i> {{object.title}}</a>`,
            type: 'string'
        },
        content: {
            type: 'string',
            list: false,
            textarea: true
        },
        author: {
            serialize: false,
            list: false,
            edit: false,
            filter: false,
            displayTemplate: `{{#if object.author.isPending}}
                <i class="fa fa-spin fa-spinner"></i>
                {{else}}
                <a href="{{routeUrl(view='people_advanced' page='details' objectId=object.author_id, true)}}">
                    {{object.author.value.name}}
                </a>
                {{/if}}`,
            set (val) {
                // eslint-disable-next-line camelcase
                this.author_id = val;
                return val;
            },

            get () {
                return Person.get({
                    id: this.author_id
                });
            }
        },
        reviewed: {
            //sqlite doesn't have boolean so we use 1,0
            type: 'number',
            value: 0,
            displayTemplate: `{{#if object.reviewed}}Yes{{else}}No{{/if}}`,
            fieldType: 'select',
            options: [{
                label: 'Yes',
                value: 1
            }, {
                label: 'No',
                value: 0
            }]
        },
        views: {
            serialize: false,
            displayTemplate: `{{#if object.views.isPending}}
                <i class="fa fa-spin fa-spinner"></i>
                {{else}}
                {{object.views.value.length}}
                {{/if}}`,
            get () {
                return Visit.getList({
                    filters: [{
                        name: 'article_id',
                        operator: 'equals',
                        value: this.id
                    }],
                    perPage: 100
                });
            }
        }
    })
});

export default {
    id: 'articles',
    connection: Article,
    title: 'Articles',
    manageButtons: [{
        iconClass: 'fa fa-check',
        buttonClass: 'success',
        text: 'Mark Reviewed',
        onClick (items) {
            items.forEach((i) => {
                i.reviewed = 1;
                Article.save(i).then(() => {
                    // pubsub.publish(TOPICS.ADD_MESSAGE, {
                    //     message: 'Item saved: ',
                    //     detail: 'ID: ' + i.attr('id')
                    // });
                });
            });
        }
    }],
    quickFilters: [{
        text: 'Reviewed',
        field: 'reviewed',
        options: [{
            value: 1,
            label: 'Yes'
        }, {
            value: 0,
            label: 'No'
        }]
    }]
};
