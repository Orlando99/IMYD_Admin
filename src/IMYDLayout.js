// in src/IMYDLayout.js
import React, { createElement, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import autoprefixer from 'material-ui/utils/autoprefixer';
import CircularProgress from 'material-ui/CircularProgress';
import withWidth from 'material-ui/utils/withWidth';
import compose from 'recompose/compose';
import logoImage from './img/logo-horizontal.gif';
import Joyride from 'react-joyride';
import _ from 'underscore';

import {
  Menu,
  AdminRoutes,
  Sidebar,
  Notification,
  setSidebarVisibility as setSidebarVisibilityAction,
} from 'admin-on-rest';

import restClient from './IMYD-REST-Client';
import { IMYDTheme } from './themes/IMYD-theme';
import AppBar from  'material-ui/AppBar';
import store from './js/localStore';
import { TOUR_TOOLTIP_STYLE } from './constants';

const styles = {
  wrapper: {
    // Avoid IE bug with Flexbox, see #467
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  appBar: {
    width: 'auto',
    marginLeft: 290,
  },
  appBarMobile: {
    backgroundColor: '#fff',
    boxShadow: 'none'
  },
  logo: {
    position: 'absolute',
    top: 2,
    left: -234,
    width: 160,
    height: 60
  },
  logoMobile: {
    position: 'absolute',
    top: 2,
    left: 10,
    width: 170,
    height: 60
  },
  body: {
    backgroundColor: '#edecec',
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    top: 0
  },
  bodyMobile: {
    backgroundColor: '#edecec',
    display: 'flex',
    flex: 1,
    overflowY: 'hidden',
    overflowX: 'auto',
    position: 'relative',
  },
  content: {
    flex: 1,
    // padding: '2em',
    overflowX: 'hidden',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  loader: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 16,
    zIndex: 1200,
  }
};

const prefixedStyles = {};
const pageTourSteps = {
  '/': [
    {
      title: 'Activity Monitor',
      text: 'See how many messages are being sent & read by users in your organization.',
      selector: '#user-stats',
      position: 'left',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Add Healthcare Professional',
      text: 'Add coworkers to your organization and send them an invitation to join you on IMYD!',
      selector: '#hp-add-button',
      position: 'bottom',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Bulk Add',
      text: 'Bulk add users to save time when inviting multiple colleagues at once.',
      selector: '#hp-bulkadd-button',
      position: 'bottom',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'View Healthcare Professionals',
      text: 'You can view users in your organization, administer them, and view their message archives.',
      selector: '#hp-view-button',
      position: 'bottom',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Patients',
      text: 'You can also perform similar actions on Patient accounts associated with your organization!',
      selector: '#patients-block',
      position: 'right',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    },
  ],
  '/healthcareprofessionals': [
    {
      title: 'Sort',
      text: 'Here on the Healthcare Professionals page, you can sort by any column to find a particular user.',
      selector: '.list-page table thead tr th:nth-child(2)',
      position: 'top',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Add Filter',
      text: 'Or, add a filter to narrow down the list and find who you need.',
      selector: '.list-page .add-filter',
      position: 'bottom',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Take Actions',
      text: 'These action icons allow you to view/edit a user\'s profile, manage their contact list, view their conversation archives, send a password reset message, or enable / disable their account.',
      selector: '.list-page table tbody tr td.column-undefined',
      position: 'top',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    }, {
      title: 'Patients Too!',
      text: 'You can perform similar actions on Patient accounts associated with your organization.',
      selector: 'span[to="/patients"]',
      position: 'right',
      isFixed: true,
      style: TOUR_TOOLTIP_STYLE,
    },
  ],
}

class IMYDLayout extends Component {
  state = {
    tourSteps: [],
  };

  resize = () => {
    let iWidth, width, bodyClass = 'body', appBarClass = 'appBar', logoClass = 'logo';

    iWidth = window.innerWidth;
    if(iWidth < 1295) {
      bodyClass = 'bodyMobile';
    }

    if(iWidth < 768) {
      this.props.setSidebarVisibility(false);
      appBarClass = 'appBarMobile';
      width = 'mobile';
      logoClass = 'logoMobile';
    } else {
      this.props.setSidebarVisibility(true);
    }

    this.setState({width, logoClass, bodyClass, appBarClass});
  }

  componentWillMount() {
    let iWidth, width, bodyClass = 'body', appBarClass = 'appBar', logoClass = 'logo';

    iWidth = window.innerWidth;
    if(iWidth < 1295) {
      bodyClass = 'bodyMobile';
    }

    if(iWidth < 768) {
      this.props.setSidebarVisibility(false);
      appBarClass = 'appBarMobile';
      width = 'mobile';
      logoClass = 'logoMobile';
    } else {
      this.props.setSidebarVisibility(true);
    }

    this.setState({width, logoClass, bodyClass, appBarClass});
  }

  componentDidMount() {
    const { pathname } = this.props;
    window.addEventListener('resize', this.resize)
    if (pathname && Object.keys(pageTourSteps).includes(pathname)) {
      this.resetTourTimeout = setTimeout(() => this.setTourSteps(store.get('settings') &&
        !store.get('settings')[`tour-on-${pathname}`] ? pageTourSteps[pathname] : []), 200);
    }
    this.settingsObserver = store.observe('settings', this.onSettingsChange);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.pathname !== newProps.pathname && newProps.pathname) {
      if (this.resetTourTimeout) {
        clearTimeout(this.resetTourTimeout);
      }
      this.resetTourTimeout = setTimeout(() => this.setTourSteps((
        Object.keys(pageTourSteps).includes(newProps.pathname) && store.get('settings') &&
          !store.get('settings')[`tour-on-${newProps.pathname}`]) ? pageTourSteps[newProps.pathname] : []
      ), 200);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    if (this.settingsObserver) {
      store.unobserve(this.settingsObserver);
    }
    if (this.resetTourTimeout) {
      clearTimeout(this.resetTourTimeout);
      this.resetTourTimeout = null;
    }
  }

  onSettingsChange = (newSettings, oldSettings) => {
    if (newSettings && newSettings[`tour-on-${this.props.pathname}`] &&
      this.state.tourSteps.length > 0) {
      this.setTourSteps([]);
    } else if (!oldSettings && newSettings && !newSettings[`tour-on-${this.props.pathname}`] &&
      this.state.tourSteps.length === 0 && Object.keys(pageTourSteps).includes(this.props.pathname)) {
      this.setTourSteps(pageTourSteps[this.props.pathname]);
    }
  }

  onTourEnd = ({ type, isTourSkipped }) => {
    if (type === 'finished' && !isTourSkipped) {
      restClient('UPDATE_SETTINGS', 'settings/data', { [`tour-on-${this.props.pathname}`]: true })
        .then((result) => {
          if (result) {
            store.set('settings', _.extend({}, store.get('settings') || {},
              { [`tour-on-${this.props.pathname}`]: true }));
          }
        });
    }
  }

  setTourSteps = (tourSteps) => this.setState({ tourSteps }, () => {
    if (tourSteps && tourSteps.length > 0) { this.joyride.reset(true); }
  })

  render() {
    const {
      children,
      customRoutes,
      dashboard,
      isLoading,
      logout,
      menu,
      catchAll,
      theme,
      title,
      // width,
    } = this.props;

    const { width,logoClass,bodyClass,appBarClass, tourSteps } = this.state;

    const muiTheme = getMuiTheme(IMYDTheme);
    if (!prefixedStyles.main) {
      // do this once because user agent never changes
      const prefix = autoprefixer(muiTheme);
      prefixedStyles.wrapper = prefix(styles.wrapper);
      prefixedStyles.main = prefix(styles.main);
      prefixedStyles.body = prefix(styles.body);
      prefixedStyles.bodySmall = prefix(styles.bodySmall);
      prefixedStyles.content = prefix(styles.content);
      prefixedStyles.contentSmall = prefix(styles.contentSmall);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={prefixedStyles.wrapper}>
          <div style={prefixedStyles.main}>
            {/*{width !== 1 && <AppBar title={title} />}*/}
            <AppBar className="app-bar" style={styles[appBarClass]} title={title} showMenuIconButton={false}>
              <img className="App-logo" src={logoImage} alt="Logo" style={styles[logoClass]}/>
            </AppBar>
              <div
              className="body"
              style={
                styles[bodyClass]
                // width === 1 ? (
                //   prefixedStyles.bodySmall
                // ) : (
                //   prefixedStyles.body
                // )
              }
            >
              <div
                style={
                  styles.content
                  // width === 1 ? (
                  //   prefixedStyles.contentSmall
                  // ) : (
                  //   prefixedStyles.content
                  // )
                }
              >
                <AdminRoutes
                  customRoutes={customRoutes}
                  dashboard={dashboard}
                  catchAll={catchAll}
                >
                  {children}
                </AdminRoutes>
              </div>
              <Sidebar theme={theme}>
                {createElement(menu || Menu, {
                  logout,
                  hasDashboard: !!dashboard,
                })}
              </Sidebar>
            </div>
            <Notification />
            {isLoading && (
              <CircularProgress
                className="app-loader"
                color="#fff"
                size={width === 1 ? 20 : 30}
                thickness={2}
                style={styles.loader}
              />
            )}
            <Joyride
              ref={c => (this.joyride = c)}
              steps={tourSteps}
              type="continuous"
              tooltipOffset={10}
              locale={{ back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' }}
              showSkipButton
              showStepsProgress
              scrollToFirstStep
              callback={this.onTourEnd}
              run
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const componentPropType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.string,
]);

IMYDLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  catchAll: componentPropType,
  customRoutes: PropTypes.array,
  dashboard: componentPropType,
  isLoading: PropTypes.bool.isRequired,
  logout: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.string,
  ]),
  menu: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  setSidebarVisibility: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  theme: PropTypes.object.isRequired,
  width: PropTypes.number,
};

IMYDLayout.defaultProps = {
  theme: IMYDTheme,
};

function mapStateToProps(state) {
  return {
    isLoading: state.admin.loading > 0,
    pathname: state.routing.location ? state.routing.location.pathname : null,
  };
}

const enhance = compose(
  connect(mapStateToProps, {
    setSidebarVisibility: setSidebarVisibilityAction,
  }),
  withWidth()
);

export default enhance(IMYDLayout);