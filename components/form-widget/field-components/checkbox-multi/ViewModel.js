import FieldInputMap from 'can-admin/components/form-widget/field-components/select-field/ViewModel';
import DefineList from 'can-define/list/list';

export default FieldInputMap.extend('CheckboxMulti', {
    value: {
        Type: DefineList,
        Value: DefineList
    },
    onChange () {
        this.dispatch('fieldchange', [{
            value: this.value, 
            name: this.properties.name
        }]);
    }
});
