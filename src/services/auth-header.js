export default function authHeader() {
    let auth = JSON.parse(localStorage.getItem('auth'));

    if (auth && auth.access_token && auth.token_type) {
        return { Authorization: auth.token_type + ' ' + auth.access_token };
    } else {
        return {};
    }
}