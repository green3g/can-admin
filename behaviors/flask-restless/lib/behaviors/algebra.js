import set from 'can-set';

function sort (sortDef, item1, item2) {
    var prop1 = String(item1[sortDef.fieldName]).toLowerCase();
    var prop2 = String(item2[sortDef.fieldName]).toLowerCase();

    // handle undefined values
    if (prop1 !== 0 && prop1 !== false && !prop1) {
        return sortDef.type === 'asc' ? 1 : -1;
    }
    if (prop2 !== 0 && prop2 !== false && !prop2) {
        return sortDef.type === 'asc' ? -1 : 1;
    }

    // handle valid values
    if (sortDef.type === 'asc') {
        return prop1 > prop2 ? 1 : -1;
    }
    return prop1 > prop2 ? -1 : 1;
}

//create a flask-restless set algebra
const algebra = new set.Algebra(
    set.props.sort('sort', sort), {
        // eslint-disable-next-line complexity
        filters (none, filters, item) {
            for (let i = 0; i < filters.length; i++) {
                const filter = filters[i];

                if (!filter.value) {
                    return true;
                }

                // handle properties that don't exist...
                // relationship props don't get sent from server
                // in flask-restless
                if (typeof item[filter.name] === 'undefined') {
                    break;
                }

                // handle each filter operator
                const val = item[filter.name];
                switch (filter.operator) {
                case 'like':
                    if (typeof val !== 'string' || typeof filter.value !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) === -1) {
                        return false;
                    }
                    break;
                case 'not_like':
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) > -1) {
                        return false;
                    }
                    break;
                case 'starts_with':
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) !== 0) {
                        return false;
                    }
                    break;
                case 'ends_with':
                    // val -> 'this is a test string'
                    // val.indexOf('string') -> 15
                    // val.length -> 21
                    //
                    // filter.value -> 'string'
                    // filter.value.length -> 6
                    // val.length - filter.value.length -> 21 - 6 = 15
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) !== val.length - filter.value.length) {
                        return false;
                    }
                    break;
                case 'equals':
                    // eslint-disable-next-line
                        if (val != filter.value) {
                        return false;
                    }
                    break;
                case 'not_equal_to':
                    // eslint-disable-next-line
                        if (val == filter.value) {
                        return false;
                    }
                    break;
                case 'greater_than':
                case 'after':
                    if (val <= filter.value) {
                        return false;
                    }
                    break;

                case 'less_than':
                case 'before':
                    if (val >= filter.value) {
                        return false;
                    }
                    break;
                default:
                    return true;
                }
            }
            return true;
        },
        perPage () {
            return true;
        },
        pageSize () {
            return true;
        },
        page () {
            return true;
        }
    });

export default algebra;
