import React, {Component} from 'react';
import withWidth from 'material-ui/utils/withWidth';
import moment from 'moment';
import { ViewTitle, GET_LIST } from 'admin-on-rest';

import restClient from '../IMYD-REST-Client';

import Welcome from './Welcome';
import HealthcareProfessionals from './ManageHealthcareProfessionals';
import Patients from './ManagePatients';
import Conversations from './ManageConversations';
import UserStats from './UserStats';

const styles = {
  welcome: { width: '100%', zIndex: 1, marginLeft: '2px' },
  top: {width: '100%', zIndex: 1, marginLeft: '2px', padding: 0},
  topMobile: {width: '100%', zIndex: 1, marginLeft: '2px', padding: '50px 0 0 0'},
  flex: {display: 'flex', margin: '1em 2em'},
  flexMobile: {display: 'grid', margin: '1em'},
  activityFlex: {display: 'flex', margin: '1em'},
  activityFlexMobile: {display: 'grid', margin: '1em 0'},
  leftCol: {flex: 1, marginRight: '1em'},
  rightCol: {flex: 1, marginLeft: '1em'},
  singleCol: {marginTop: '2em'},
  fullWidth: {width: '100%'}
};

class Dashboard extends Component {
  state = {};

  resize = () => {
    let iWidth = window.innerWidth, width, welcomeClass = 'top', bodyClass = 'flex', activityClass = 'activityFlex';

    // To ensure that the menu is visible if resizing occurs
    if(iWidth < 1295) {
      bodyClass = 'flexMobile';
      activityClass = 'activityFlexMobile';
    }

    if(iWidth < 768) {
      width = 'mobile';
      welcomeClass = 'topMobile';
    }

    this.setState({width, bodyClass, activityClass, welcomeClass});
  }

  fixKeys(obj, find, replace) {
    let objString = JSON.stringify(obj);
    const newObj = objString.replace(find, replace);
    return JSON.parse(newObj);
  }

  componentWillMount() {
    let iWidth = window.innerWidth, width, welcomeClass = 'top', bodyClass = 'flex', activityClass = 'activityFlex';

    // To ensure that the menu is visible if resizing occurs
    if(iWidth < 1295) {
      bodyClass = 'flexMobile';
      activityClass = 'activityFlexMobile';
    }

    if(iWidth < 768) {
      width = 'mobile';
      welcomeClass = 'topMobile';
    }

    this.setState({width, bodyClass, activityClass, welcomeClass});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize)

    restClient(GET_LIST, 'patients', {
      filter: {},
      sort: { field: 'lastName', order: 'ASC' },
      pagination: { page: 1, perPage: 9999 },
    })
      .then(patients => {
        if(patients) {
          this.setState({patients: patients.data});
          this.setState({nbPatients: patients.total > 0 ? patients.total : 0});
        }
      }).catch(e => {});

    restClient(GET_LIST, 'healthcareprofessionals', {
      filter: {},
      sort: { field: 'lastName', order: 'ASC' },
      pagination: { page: 1, perPage: 9999 },
    })
      .then(hp => {
        if(hp) {
          this.setState({hp: hp.data});
          this.setState({nbHP: hp.total > 0 ? hp.total : 0});
        }
      }).catch(e => {});

    restClient(GET_LIST, 'conversations', {
      filter: {},
      sort: { field: 'id', order: 'Desc' },
      pagination: { page: 1, perPage: 10 },
    })
      .then(convos => {
        if(convos) {
          this.setState({convos: convos.data});
          this.setState({nbConvos: convos.total > 0 ? convos.total : 0});
        }
      }).catch(e => {});


    restClient('GET', 'activitymonitor', {
      mode: 'WEEK',
      range: 12
    })
      .then(am => {
        am = this.fixKeys(am, /displayed/g, 'read');
        if(am) {
          am.data.forEach((dataset) => {
            dataset.week = moment().day("Monday").week(dataset.week).format('MM/DD');
          });
          this.setState({am: am.data});
        }
      }).catch(e => {});

  }

  render() {
    const {
      nbHP,
      hp,
      nbPatients,
      patients,
      nbConvos,
      convos,
      am,
      welcomeClass,
      bodyClass,
      activityClass,
      width,
    } = this.state;

    return (
      <div>
        {width === 'mobile' && <ViewTitle className='yoda' title="Admin Portal"/>}
        <Welcome style={styles[welcomeClass]}/>
        <div style={styles.fullWidth}>
          <div style={styles[bodyClass]}>
            <HealthcareProfessionals
              nb={nbHP}
              hp={hp}
              title={'Healthcare Professionals'}
            />
            <Patients
              nb={nbPatients}
              patients={patients}
              title={'Patients'}
            />
            <Conversations nb={nbConvos} convos={convos} title={'Conversations'}/>
          </div>
        </div>
        <div style={styles[activityClass]}>
          <div style={styles.fullWidth}>
            <UserStats title={'Activity'} am={am} />
          </div>
        </div>
      </div>
    );
  }
}

export default withWidth()(Dashboard);
