import connect from 'can-connect';
import canConstructor from 'can-connect/constructor/constructor';
import canMap from 'can-connect/can/map/map';
import canRef from 'can-connect/can/ref/ref';
import constructorStore from 'can-connect/constructor/store/store';
import dataCallbacks from 'can-connect/data/callbacks/callbacks';
import dataParse from 'can-connect/data/parse/parse';
import realTime from 'can-connect/real-time/real-time';
import callbacksOnce from 'can-connect/constructor/callbacks-once/callbacks-once';

import restlessData from './behaviors/restlessData';
import restlessParse from './behaviors/restlessParse';

import dev from 'can-util/js/dev/dev';

import $ from 'jquery';

/**
 * @typedef {FlaskConnectOptions} can-admin/behaviors/flask-restless.types.FlaskConnectOptions FlaskConnectOptions
 * @parent can-admin/behaviors/flask-restless.types
 * @option {can.Map} map The template object to use when creating new objects. This
 * map can supply default values, getters and setters, and types of properties on an object
 * @option {String} idProp The proerty to use for the id
 * @option {String} name The name of the connection to use. This should be unique across the application, and should reference the data type that flask-restless is serving. Flask Restless defaults to using the tablename or the Class name as the data type name.
 * @option {String} url The url to the Flask-Restless resource
 */

/**
 *
 * A factory function that creates a new Flask-Restless API connection.
 * @parent can-admin/behaviors/flask-restless
 * @signature `connectionFactory(options)`
 * @param {can-admin/behaviors/flask-restless.types.FlaskConnectOptions} options The factory options
 * @return {can-connect/can/super-map}
 * A special super map that contains an additional property `metadata`
 * of type [{MetadataObject}](can-admin/behaviors/flask-restless.types.MetadataObject).
 * @link can-admin/behaviors/flask-restless.types.MetadataObject MetadataObject
 */

/**
  * A custom base connection factory for can-connect. Similar
  * to the `can-connect/can/base` connection but adds spectre-canjs behaviors
  * @function base
  * @signature
  * @param  {Object} options Behavior options. Mixin additional behaviors using the `options.behaviors` (array)
  * @return {Connection}         The can-connect connection object
  * @parent util/behaviors
  *
  */
export default function (options) {

    var behaviors = [
        restlessParse,
        canConstructor,
        canMap,
        canRef,
        restlessData,
        constructorStore,
        dataCallbacks,
        dataParse,
        realTime,
        callbacksOnce
    ];

    if (options.behaviors) {
        behaviors = behaviors.concat(options.behaviors);
    }

    // Handles if jQuery isn't provided.
    if ($ && $.ajax) {
        options.ajax = $.ajax;
    }

    // backwards compatibility
    if (options.map) {
        dev.warn('can-admin/behaviors/flask-restless: options.map is deprecated, use options.Map instead');
        options.Map = options.map;
    }

    return connect(behaviors, options);
}
