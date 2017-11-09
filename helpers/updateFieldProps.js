/**
 * Modifies an array of fields with new properties
 * @param  {Array<Field>} fields The fields to update
 * @param  {Object} props  the properties to update `{field: {propName: prop}}`
 * @return {Array<Field>}  the modified array of fields
 */
export function updateFieldProps (fields, props) {
    for (const prop in props) {
        if (props.hasOwnProperty(prop)) {
            const fieldProps = fields.filter((field) => {
                return field.name === prop;
            });
            if (fieldProps.length) {
                fieldProps[0].update(props[prop]);
            } else {
                fields.push(props[prop]);
            }
        }
    }
    return fields;
}

export default updateFieldProps;
