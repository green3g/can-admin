import connect from 'can-connect';
import $ from 'jquery';

import {ParameterMap} from './Params';
import algebra from './algebra';
import DefineList from 'can-define/list/list';
import DefineMap from 'can-define/map/map';


/**
 * @typedef {MetadataObject} can-admin/behaviors/flask-restless.types.MetadataObject MetadataObject
 * @parent can-admin/behaviors/flask-restless.types
 * @option {Number} totalItems The total number of items available through this api
 * @option {can.Map} relationships Keys that represent field names where relationships exist. Each key's value in this object is set to `true` to keep track of which fields are relationships.
 */
const MetaMap = DefineMap.extend('Properties', {seal: false}, {
    total: {
        type: 'number',
        value: 0
    },
    relationships: {Value: DefineMap}
});


export default connect.behavior('FlaskRestlessData', function (base) {
    return {
        init () {

            this.metadata = new MetaMap();

            this.algebra = algebra;

            this.ajax = this.ajax || $.ajax;
            $.ajaxSetup({
                dataType: 'json',
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                }
            });
            //a new list which should hold the objects
            if (!base.List) {
                this.List = DefineList.extend('FlaskRestlessList', {
                    '#': base.Map
                });
            }
            base.init.apply(this, arguments);

        },
        getListData (params) {

            return new Promise((resolve, reject) => {

                // convert parameters to flask-restless params
                params = new ParameterMap(params).serialize();

                const promise = this.ajax({
                    url: this.url,
                    method: 'GET',
                    data: params
                });
                promise.then((props) => {

                    // update the metadata
                    this.metadata.set(props.meta);

                    resolve(props);
                }, reject);
            });
        },
        getData (params) {
            return new Promise((resolve, reject) => {
                const promise = this.ajax({
                    url: `${this.url}/${params[this.idProp]}`,
                    method: 'GET'
                });
                promise.then(resolve, reject);
            });
        },
        createData (attrs) {
            return new Promise((resolve, reject) => {
                const data = {};

                //exclude relationship properties
                for (var a in attrs) {
                    if (attrs.hasOwnProperty(a) && !this.metadata.relationships[a]) {
                        data[a] = attrs[a];
                    }
                }

                //post attributes to the create url
                const promise = this.ajax({
                    url: this.url,
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json'
                    },
                    data: JSON.stringify({
                        data: {
                            attributes: data,
                            type: this.name
                        }
                    }),
                    method: 'POST'
                });

                promise.then(resolve, reject);
            });
        },
        updateData (attrs) {
            return new Promise((resolve, reject) => {
                const data = {};

                //exclude relationship properties
                for (var a in attrs) {
                    if (attrs.hasOwnProperty(a) && !this.metadata.relationships[a] && a !== this.idProp) {
                        data[a] = attrs[a];
                    }
                }
                const promise = this.ajax({
                    url: `${this.url}/${attrs[this.idProp]}`,
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json'
                    },
                    data: JSON.stringify({
                        data: {
                            attributes: data,
                            type: this.name,
                            id: attrs[this.idProp]
                        }
                    }),
                    method: 'PATCH'
                });
                promise.then(resolve, reject);
            });
        },
        destroyData (attrs) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: `${this.url}/${attrs[this.idProp]}`,
                    dataType: 'json',
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json'
                    }
                }).then(resolve, reject);
            });
        }
    };
});