import * as request from 'axios';
import config from '../js/configs';

export function getUserSubscription() {
    return request.get(config.apiUrl + '/api/v1/subscription/subscriptionFeatures', {
        headers: {
            'x-auth-token': getCookie('x-auth-token')
        }
    })
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}