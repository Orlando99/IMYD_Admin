import Cookies from 'js-cookie';
import configs from '../js/configs';
import restClient from '../IMYD-REST-Client';

import store from './localStore';

export default class AutoLogout {
  constructor() {
    this.debug = configs.debug === 'true' || false;
    this.notificationTitle = 'Session Idle Timeout';
    this.notificationBody = 'Automatic logout in 1 minute.';
    // this.soundNotifications = false;
    this.warnTime = 14 * 60 * 1000;
    this.logoutTime = 15 * 60 * 1000;
    this.hasPermission = false;

    restClient('GET_SETTINGS', 'settings/data', {})
      .then((result) => {
        if(result) {
          if (this.debug) {
            console.log('User Settings, Debug:', this.debug, result.data);
          }
          let timeoutMins = (result.data || {}).timeoutInMins;
          // this.soundNotifications = result.data.enableSoundNotification;

          if (this.debug || timeoutMins) {
            this.warnTime = this.debug ? 9000 : (timeoutMins - 1) * 60 * 1000;
            this.logoutTime = this.debug ? 15000 : (timeoutMins) * 60 * 1000;
          }
          store.set('settings', result.data || {});
        }
        this.closeWarnTime = this.logoutTime;

        if(this.debug || configs.mode === 'production') {
          this.events = ['load', 'mousemove', 'mousedown',
            'click', 'scroll', 'keypress'];

          this.warn = this.warn.bind(this);
          this.logout = this.logout.bind(this);
          this.resetTimeout = this.resetTimeout.bind(this);

          for (var i in this.events) {
            window.addEventListener(this.events[i], this.resetTimeout);
          }

          this.setTimeout();
          if (this.debug) {
            console.log('Autologout initialized, Timeouts:', this.warnTime, this.logoutTime);
          }
          if(window.Notification && Notification.permission !== "denied") {
            Notification.requestPermission( (status) => {  // status is "granted", if accepted by user
              if(status === 'granted') {
                this.hasPermission = true;
              }
            });
          }
        }
      });
  }

  clearTimeout() {
    if(this.warnTimeout)
      clearTimeout(this.warnTimeout);

    if(this.logoutTimeout)
      clearTimeout(this.logoutTimeout);
  }

  setTimeout() {
    if (this.warnTime > 0 && this.logoutTime > 0) {
      this.warnTimeout = setTimeout(this.warn, this.warnTime);
      this.logoutTimeout = setTimeout(this.logout, this.logoutTime);
    }    
  }

  resetTimeout() {
    // console.log('Reset logout.');
    this.clearTimeout();
    this.setTimeout();
  }

  warn() {
    console.log('You will be logged out automatically in 1 minute.');
    if(this.hasPermission) {
      let n = new Notification(this.notificationTitle, {
          body: this.notificationBody,
          iconUrl: '/notification_logo.png',
          icon: '/notification_logo.png',
          requireInteraction: false
        }
      );
      // Close the warning at the same time as the logout will occur
      setTimeout(n.close.bind(n), this.debug ? 5000 : 50000);

      n.onclick = function(x) { window.focus(); this.close(); };
    } else {
      console.log('Notifications are disabled in your browser, please enable notifications if you would like to receive a warning prior to auto logout.');
    }
  }

  logout() {
    this.destroy();

    console.log('Logging out...', { domain: this.debug ? configs.domain : `.${ configs.domain }` });
    Cookies.remove('x-auth-token', { domain: this.debug ? configs.domain : `.${ configs.domain }` });
    Cookies.remove('IMYD-token-expiration', { domain: this.debug ? configs.domain : `.${ configs.domain }` });
    Cookies.remove('JSESSIONID', { domain: this.debug ? configs.domain : `.${ configs.domain }` });
    window.location.reload();
  }

  destroy() {
    console.log('Destroy timeouts.');
    this.clearTimeout();

    for(var i in this.events) {
      window.removeEventListener(this.events[i], this.resetTimeout);
    }
  }
}