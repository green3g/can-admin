import DefineMap from 'can-define/map/map';
import defaultContent from './defaultContent.stache';

export default DefineMap.extend('PageMap', {seal: false}, {
    id: 'string',
    title: 'string',
    iconClass: 'string',
    render: {
        value () {
            return defaultContent;
        }
    }

});
