import renderAdmin from './templates/admin.stache';
import './styles/admin.less';

import Article from './Article';
import PersonBasic from './Person_Basic';
import PersonAdvanced from './Person_Advanced';


export default {
    views: [Article, PersonBasic, PersonAdvanced],
    getActiveView (id) {
        return this.views.filter((view) => {
            return view.id === id;
        })[0];
    },
    render: renderAdmin
};
