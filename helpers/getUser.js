
export function getUser () {
    return __APP && __APP.auth.authenticated ? __APP.auth.user : 'Anonymous';
}

export default getUser;
