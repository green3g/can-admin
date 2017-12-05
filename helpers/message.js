
import topic from 'pubsub-js';
import {TOPICS as T} from 'can-admin/app/constants';

export const message = {
    error (m) {
        topic.publish(T.ADD_TOAST, {heading: 'Oops!', body: m, severity: 'error', autoHide: 10000});
    },
    success (m) {
        topic.publish(T.ADD_TOAST, {heading: 'Success!', body: m, severity: 'success', autoHide: 10000});
    },
    warning (m) {
        topic.publish(T.ADD_TOAST, {heading: 'Oops!', body: m, severity: 'warning', autoHide: 10000});
    }
};

export default message;
