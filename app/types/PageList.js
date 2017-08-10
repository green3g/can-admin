import DefineList from 'can-define/list/list';
import PageMap from './PageMap';

export default DefineList.extend('PageList', {
    '#': PageMap,
    isValid (pageId) {
        if (!this.length) {
            return false;
        }
        if (!pageId) {
            return false;
        }
        return this.filter((p) => {
            return p.id === pageId;
        }).length > 0;
    },
    byId (pageId) {
        return this.filter((p) => {
            return p.id === pageId;
        })[0] || {};
    }
});