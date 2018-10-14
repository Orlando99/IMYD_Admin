// in src/customRoutes.js
import React from 'react';
import {Route} from 'react-router-dom';
import UserConvos from '../user_management/UserConvos';
import UserRoster from '../user_management/UserRoster';
import UserBulk from '../user_management/UserBulk';
import OrgUserConvoShow from "../../OrgUserConvos";
import EMRIntegration from '../preset_management/EMRIntegration';
import NotImplemented from '../../NotImplemented';

export default [
  <Route path="/userconvos" exact render={(props) => {
    if (props.location.state) {
      return (<UserConvos convos={props.location.state.data} {...props}/>);
    } else {
      return (<UserConvos convos={[]} {...props}/>);
    }
  }}/>,
  <Route path="/userroster" exact render={(props) => {
    if (props.location.state) {
      return (<UserRoster convos={props.location.state.data} {...props}/>);
    } else {
      return (<UserRoster convos={[]} {...props}/>);
    }
  }}/>,
  <Route path="/contactsroster" exact render={(props) => {
    if (props.location.state) {
      return (<UserRoster convos={props.location.state.data} {...props} forPreset />);
    } else {
      return (<UserRoster convos={[]} {...props} forPreset />);
    }
  }}/>,
  <Route path="/userbulk/:type" exact render={(props) => {
    if (props.location.state) {
      return (<UserBulk convos={props.location.state.data} {...props}/>);
    } else {
      return (<UserBulk convos={[]} {...props}/>);
    }
  }}/>,
  <Route path="/orguserconvos/:type" exact render={(props) => {
    if (props.location.state) {
      return (<OrgUserConvoShow convos={props.location.state.data} {...props}/>);
    } else {
      return (<OrgUserConvoShow convos={[]} {...props}/>);
    }
  }}/>,
  <Route
    path="/emrintegration"
    exact
    render={(props) => (<EMRIntegration {...props}/>)}
  />,
  <Route path="/NotImplemented" exact render={(props) => {
      return (<NotImplemented {...props}/>);
  }}/>
];