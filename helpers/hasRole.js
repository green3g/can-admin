

export function hasRole (roles) {
    if (typeof window.__APP === 'undefined') {
        return false;
    }

    // if we're not authenticated, nope
    if (!__APP || !__APP.auth.authenticated) {
        return false;
    }

    // admin has all roles so return true
    if (__APP.auth.roles.indexOf('admin') > -1) {
        return true;
    }

    // look for each role if one matches
    for (var i = 0; i < roles.length; i ++) {
        if (__APP.auth.roles.indexOf(roles[i]) !== -1) {
            return true;
        }
    }
    return false;
}

export default hasRole;
