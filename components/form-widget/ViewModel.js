import DefineMap from 'can-define/map/map';
import FieldIteratorMap from '~/util/field/base/FieldIteratorMap';
import canBatch from 'can-event/batch/batch';
import DefineList from 'can-define/list/list';

export const ActionMap = DefineMap.extend({
    label: 'string',
    buttonClass: {type: 'string', value: 'btn btn-primary'},
    iconClass: {type: 'string'}
});

export const ActionList = DefineList.extend({
    '#': ActionMap
});

/**
 * @constructor form-widget.ViewModel ViewModel
 * @parent form-widget
 * @group form-widget.ViewModel.props Properties
 * @group form-widget.ViewModel.events Events
 *
 * @description A `<form-widget />` component's ViewModel. This viewmodel
 * extends the [util/field/ ]'s properties
 */
const ViewModel = FieldIteratorMap.extend('FormWidget', {
    /**
     * @prototype
     */
    /**
    * A string referencing a field property that will exclude that field
    * from this classes fields. The default is `'edit'`.
    * @property {String} form-widget.ViewModel.props.excludeFieldKey excludeFieldKey
    * @parent form-widget.ViewModel.props
    */
    excludeFieldKey: {
        value: 'edit'
    },
    /**
     * Whether or not to show the saving icon when the submit button is clickered.
     * @property {HTMLBoolean} form-widget.ViewModel.props.object object 
     * @parent form-widget.ViewModel.props
     */
    showSaving: {type: 'htmlbool', value: true},
    /**
     * A property that converts this class's object to an array of
     * fields if fields are not provided.
     * @property {DefineMap} form-widget.ViewModel.props.object object
     * @parent form-widget.ViewModel.props
     */
    object: {
        get () {
            return this.formObject;
        }
    },
    actions: {
        Type: ActionList
    },
    /**
     * Whether or not to show the submit/cancel buttons
     * @property {Boolean} form-widget.ViewModel.props.showButtons
     * @parent form-widget.ViewModel.props
     */
    showButtons: {
        type: 'boolean',
        value: true
    },
    /**
     * Whether or not this form should be an inline (horizontal) form
     * @property {Boolean} form-widget.ViewModel.props.inline
     * @parent form-widget.ViewModel.props
     */
    inline: {
        type: 'boolean',
        value: false
    },
    /**
     * The connection info for this form's data. If this is provided, the
     * object will be fetched using the objectId property
     * @property {can-connect} form-widget.ViewModel.props.connection
     * @link https://canjs.com/doc/can-connect.html can-connect
     * @parent form-widget.ViewModel.props
     */
    connection: {
        value: null
    },
    /**
     * The object id of the item to retrieve. If this and [form-widget.ViewModel.props.connection] is provided, a request
     * will be made to the connection object with the specified id.
     * @property {Number} form-widget.ViewModel.props.objectId
     * @parent form-widget.ViewModel.props
     */
    objectId: {
        type: 'number',
        set: function (id) {
            const promise = this.fetchObject(this.connection, id);
            this.promise = promise;
            return id;
        }
    },
    /**
     * The pending promise if the object is being retrieved or null
     * @property {Promise}  form-widget.ViewModel.props.promise
     * @parent form-widget.ViewModel.props
     */
    promise: {
        value: null
    },
    /**
     * An object representing the current state of the values passed to the form.
     * If the fields have changed, this object will be updated when the submit
     * button is pressed and the validations have passed. To capture current
     * state of the form, use [form-widget.ViewModel.props.dirtyObject].
     * @property {DefineMap} form-widget.ViewModel.props.formObject
     * @parent form-widget.ViewModel.props
     */
    formObject: DefineMap,
    /**
     * An object set with values that have changed since the form was initialized
     * @property {DefineMap} form-widget.ViewModel.props.dirtyObject dirtyObject
     * @parent form-widget.ViewModel.props
     */
    dirtyObject: {
        Value: DefineMap.extend('FormDirtyObject', {seal: false}, {
            __isDirtyObject: {value: true, serialize: false},
            __isDirty: {value: false, serialize: false}
        })
    },
    /**
     * An object consisting of validation error strings
     * ```javascript
     *{
     *    field: 'error message',
     *    otherfield: 'another error message'
     *}
     * ```
     * @property {Object} form-widget.ViewModel.props.validationErrors
     * @parent form-widget.ViewModel.props
     */
    validationErrors: {
        get (val) {
            if (val) {
                return val;
            }
            var define = {};
            this.fields.forEach((f) => {
                define[f.name] = '*';
            });
            const Validation = DefineMap.extend({seal: false}, define);
            return new Validation();
        }
    },
    /**
     * Whether or not this form is valid and can be submitted. If this is
     * false, the form will not dispatch the `submit` event when it is submitted.
     * Instead, it will dispatch a `submit-fail` event
     * @property {Boolean} form-widget.ViewModel.props.isValid isValid
     * @parent form-widget.ViewModel.props
     */
    isValid: {
        get () {
            if (!this.dirtyObject || !this.formObject) {
                return true;
            }
            let isValid = true;
            for (let i = 0; i < this.fields.length; i++) {
                const field = this.fields[i];
                const name = field.name;
                const currentValue = this.dirtyObject[name] || this.formObject[name];
                if (this.validationErrors[name]) {
                    isValid = false;
                } else {
                    const error = this.validationErrors[name] = this.getValidationError(field, currentValue);
                    if (error) {
                        isValid = false;
                    }
                }
            }
            return isValid;
        }
    },
    /**
     * This property is set to true when the save button is clicked.
     * It sets the save button to a loading state
     * @property {Boolean} form-widget.ViewModel.props.isSaving
     * @parent form-widget.ViewModel.props
     */
    isSaving: {
        value: false,
        type: 'boolean'
    },
    /**
     * Fetches and replaces the formObject with a new formObject
     * @function fetchObject
     * @signature
     * @param  {connection} con The supermap connection to the api service
     * @param  {Number} id  The id number of the object to fetch
     * @return {Promise} A promise resolved when the object is fetched from can-connect
     */
    fetchObject (con, id) {
        if (!con || !id) {
            return null;
        }
        var promise = con.get({
            id: id
        });
        promise.then((obj) => {
            this.formObject = obj;
        });
        return promise;
    },
    /**
     * Called when the form is submitted. The object is updated by calling
     * it's `save` method. The event `submit` is dispatched.
     * @function submitForm
     * @signature
     * @param {Object} vm The scope of the form (this view model)
     * @param {Form} form the dom form
     * @param {Event} event the dom form event
     * @return {Boolean} returns false to prevent form submissions
     */
    submitForm () {

        // we're currently saving
        if (this.isSaving) {
            return false;
        }

        // we're not valid yet
        if (!this.isValid) {
            this.dispatch('submitfail', [this.formObject, this.validationErrors]);
            return false;
        }

        // show a saving indicator
        if (this.showSaving) {
            this.isSaving = true;
        }
        const formObject = this.formObject;

        // temporary workaround for setting array values on define map
        const serialized = this.dirtyObject.serialize();
        canBatch.start();
        for (var fieldIndex = 0; fieldIndex < this.fields.length; fieldIndex ++) {
            const name = this.fields[fieldIndex].name;
            if (serialized.hasOwnProperty(name)) { 
                this.formObject[name] = serialized[name]; 
            }
        }
        canBatch.stop();
        // formObject.set(this.dirtyObject.serialize());
        this.dispatch('submit', [formObject]);
        return false;
    },
    dispatchEvent (eventName) {
        if (eventName === 'submit') {
            this.submitForm();
        } else {
            this.dispatch(eventName, [this.formObject]);
        }
    },
    /**
     * Sets the formObject value when a field changes. This will allow for future
     * functionality where the form is much more responsive to values changing, like
     * cascading dropdowns. Dispatches the `fieldchange` event when a field changes.
     * This updates the [form-widget.ViewModel.props.dirtyObject] and calls the
     * validation method on the field.
     * @function setField
     * @signature
     * @param  {util/field/Field} field  The field object properties
     * @param  {domElement} domElement The form element that dispatched the event
     * @param  {Event} event  The event object and type
     * @param  {FieldChangeEventObject} props  The value that was passed from the field component
     */
    setField (field, domElement, event, props) {
        const value = props.value;
        // update our dirty form field
        this.dirtyObject.set(field.name, value);

        // check for valid field value and don't update if it's not
        const error = this.validationErrors[field.name] = this.getValidationError(field, value);
        if (error) {
            return;
        }

        // update and dispatch field change event
        // if the value is different
        if (this.formObject[field.name] !== value) {
            this.dirtyObject.__isDirty = true;
            this.dispatch('fieldchange', [{
                name: field.name,
                value: value,
                dirty: this.dirtyObject,
                current: this.formObject
            }]);
        }
    },
    /**
     * Validates a field with a value if the field has a [util/field/Field.props.validate] property
     * @function getValidationError
     * @param  {Object} field The field object to validate
     * @param  {value} value The value of the field to validate
     * @return {String} The validation error or null
     */
    getValidationError (field, value) {
        return field.validate ? field.validate({
            name: field.name,
            value: value,
            dirty: this.dirtyObject,
            current: this.formObject
        }) : null;
    }
});

export default ViewModel;
