
// in src/AuthClient.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'admin-on-rest';
import configs from './js/configs';
import Cookies from 'js-cookie';
import Utility from "./js/utilities";
import autologout from './js/autologout';
import store from './js/localStore';

let AutoLogout;

// const login = (params) => {
//   const {username, password} = params;
//
//   const request = new Request(configs.socketUrl + `/login?username=${username}&password=${password}`, {
//     mode: 'no-cors',
//     method: 'POST',
//     headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'}),
//     credentials: 'same-origin'
//     // credentials: 'include'
//   })
//   return fetch(request)
//     .then(res => {
//       return Promise.resolve();
//     })
//   // Notes found:
//   // I had to use credentials: 'include' on the client side and CORS_ALLOW_CREDENTIALS = True in my django app.
//   // Also setting my cookie with 127.0.0.1 in localhost response.set_cookie('my_cookie', value=token, httponly=True, domain='127.0.0.1')
// };

const tokenRegister = (params) => {
  const {username, password} = params;

  const request = new Request(`${configs.authUrl}/tokens/imUser/new`, {
    method: 'POST',
    body: JSON.stringify({username, password}),
    headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'}),
  })
  return fetch(request)
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        console.log('Error response:', response);
        throw new Error(response.statusText);
      }
      return response.text();
    })
    .then((token) => {
      setLoggedIn(token);
    });
};

const tokenRefresh = (token) => {
  // Check for webchat cookie token, if exists, bypass local check.
  const
    expiration = decodeURI(Cookies.get('IMYD-token-expiration'));

  const request = new Request(`${configs.authUrl}/tokens/imUser/refresh`, {
    method: 'POST',
    body: token,
    headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'}),
  })
  return fetch(request)
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {

        console.log('Token refresh error response:', response);
        // throw new Error(response.statusText);
        setLoggedOut();
        window.location.reload();
      }
      return response.text();
    })
    .then((token) => {

      console.log('Token refreshed due to expiration: ', expiration, 'current:' + new Date());
      setLoggedIn(token);
      return Promise.resolve();
    });
};

const setLoggedIn = (token) => {
  const
    expiration = calcExpiration(new Date(), 470),
    tokenExpiration = calcExpiration(new Date(), configs.tokenTimeout).toString();

  Cookies.set('x-auth-token', token, {expires: expiration});
  Cookies.set('IMYD-token-expiration', encodeURI(tokenExpiration));
};

const setLoggedOut = () => {
  Cookies.remove('x-auth-token');
  Cookies.remove('IMYD-token-expiration');
  Cookies.remove('JSESSIONID');
  store.remove('settings');
  if (AutoLogout) {
    AutoLogout.destroy();
    AutoLogout = null;
  }
};

const isLoggedIn = () => {
  const
    token = Cookies.get('x-auth-token'),
    tokenExpiration = decodeURI(Cookies.get('IMYD-token-expiration')),
    expirationDate = new Date(tokenExpiration);

  // Refresh token
  if(isExpiring(expirationDate)) {
    tokenRefresh(token);
  }
  return (token && Utility.parseJWT().userType.indexOf('ADMIN') >= 0) || false;
};

const calcExpiration = (date, minutes) => {
    return new Date(date.getTime() + minutes*60000);
};

const isExpiring = (eDate) => {
  const date = new Date(eDate);
  return new Date() >= new Date(date.getTime());
};

export default (type, params) => {
  if (type === AUTH_LOGIN) {
    if(isLoggedIn()) {
      return Promise.resolve();
    }

    return tokenRegister(params);
  }
  // called when the API returns an error
  if (type === AUTH_ERROR) {
    const {status} = params;
    if (status === 401 || status === 403 || status === 404) {
      setLoggedOut();
      if(configs.mode === 'production') {
        window.location = configs.chatURL;
      }
      console.log('AUTH_ERROR:', 'Error on localhost, will redirect to login in QA/PROD. Mode = ', configs.mode);
      return Promise.reject();
    }
    return Promise.resolve();
  }
  // called when the user clicks on the logout button
  if (type === AUTH_LOGOUT) {
    setLoggedOut();
    if(configs.mode === 'production') {
      window.location = configs.chatURL;
    }
    console.log('AUTH_LOGOUT:', 'Error on localhost, will redirect to login in QA/PROD. Mode = ', configs.mode);
    return Promise.resolve();
  }
  // called when the user navigates to a new location
  if (type === AUTH_CHECK) {

    if(isLoggedIn()) {
      // Initialize autologout; parameter is debug = true|false
      if (!AutoLogout) {
        AutoLogout = new autologout(true);
      }

      return Promise.resolve();
    } else {
      if(configs.mode === 'production') {
        window.location = configs.chatURL;
      }
      console.log('AUTH_CHECK:', 'Error on localhost, will redirect to login in QA/PROD. Mode = ', configs.mode);
      return Promise.reject();
    }
  }
  return Promise.reject('Unknown method');
}