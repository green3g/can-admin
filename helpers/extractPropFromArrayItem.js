
/**
 * A helper function to find the label in an array of options
 * @param  {Number} id      The id number of the option
 * @param  {Array<options>} options Array of label,value,id objects
 * @param {String} type The type of property to try and find. This defaults to label
 * @return {String}         The label of the option, if not found returns the id provided
 */
export function extractPropFromArrayItem (array, prop, whereProp, whereVal) {
    const item = array.filter((item) => {
    //loose comparator to allow comparing numbers and strings
    // eslint-disable-next-line eqeqeq
        return whereVal == item[whereProp];
    })[0];

    if (item) {
        return item[prop];
    }
    return null;
}

export default extractPropFromArrayItem;
