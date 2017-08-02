import connect from 'can-connect';

export default connect.behavior('FlaskRestlessData', function () {
    return {
    
        parseListProp: 'data',
        parseInstanceData (props) {

            //if for some reason we don't have an object, return
            if (!props) {
                return {};
            }

            //sometimes props are actually in the data property
            //could be a bug?
            if (props.data) {
                props = props.data;
            }

            //build a new object that consists of a combination of the FlaskRestless
            //response object
            const obj = props.attributes;

            // flask restless doesn't include the id prop in the attributes so we set it
            if (!obj[this.idProp]) {
                obj[this.idProp] = props.id;
            }

            // include the relationship id's
            for (var rel in props.relationships) {
                if (props.relationships.hasOwnProperty(rel) &&
                    props.relationships[rel].hasOwnProperty('data')) {

                    //if its an array, extract an array of the ids
                    obj[rel] = Array.isArray(props.relationships[rel].data) ? props.relationships[rel].data.map((item) => {
                        return item.id;
                    }) : props.relationships[rel].data ? props.relationships[rel].data.id : null;

                    // update the metadata relationships
                    this.metadata.relationships.set(rel, true);
                }
            }

            return obj;
        }
    };

});
