import FieldInputMap from 'can-admin/components/form-widget/field-components/select-field/ViewModel';
import DefineList from 'can-define/list/list';

export default FieldInputMap.extend('CheckboxMulti', {
    value: {
        Type: DefineList,
        Value: DefineList
    },
    /**
     * Properties for the select dropdown. The properties object is similar to that of
     * `util/field/Field` object, except it includes additional properties to define
     * the select dropdown behavior.
     * @parent checkbox-multi.ViewModel.props
     * @property {checkbox-multi.types.SelectFieldProperty} form-widget/field-components/checkbox-multi.ViewModel.properties properties
     */
    properties: {
        set (props) {
            if (props.optionsPromise) {
                props.optionsPromise.then((options) => {
                    props.set('options', options);
                });
            } 
            return props;
        }
    },
    onChange () {
        this.dispatch('fieldchange', [{
            value: this.value
        }]);
    }
});
