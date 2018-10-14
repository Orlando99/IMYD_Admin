// in src/App.js
import React from 'react';
import {Admin, Resource} from 'admin-on-rest';
import IMYDLogin from './IMYD-login';

import { restClientInstance } from './IMYD-REST-Client';

import {HPList, HPEdit, HPShow, HPCreate} from './HealthcareProfessionals';
import {PatientList, PatientEdit, PatientShow, PatientCreate} from './Patients';
import { UserPresetList, UserPresetEdit, UserPresetShow, UserPresetCreate } from './UserPresets';
import {ConvoList} from './Convos';

import HPIcon from 'material-ui/svg-icons/social/group';
import PatientIcon from 'material-ui/svg-icons/action/face';
import ConvoIcon from 'material-ui/svg-icons/communication/chat';
import SettingsIcon from 'material-ui/svg-icons/action/settings';

import Dashboard from './dashboard/Dashboard';
import {IMYDTheme} from './themes/IMYD-theme';

import authClient from './AuthClient';
import IMYDLayout from './IMYDLayout';
import IMYDMenu from './IMYDMenu';

import customRoutes from './components/routes/CustomRoutes';
import NotFound from './NotFound';

const App = () => (
  <Admin ref={e => restClientInstance.setStore(e._reactInternalInstance._renderedComponent._renderedComponent._instance.store)}
         catchAll={NotFound} appLayout={IMYDLayout} menu={IMYDMenu} authClient={authClient}
         loginPage={IMYDLogin} dashboard={Dashboard} restClient={restClientInstance.client} theme={IMYDTheme} customRoutes={customRoutes}
         title="Admin Portal">
    <Resource name="healthcareprofessionals" options={{label: "Healthcare Professionals"}} list={HPList} icon={HPIcon}
              create={HPCreate} show={HPShow} edit={HPEdit}/>
    <Resource name="jobtitles"/>
    <Resource name="designations"/>
    <Resource name="practicetypes"/>
    <Resource name="facilities"/>
    <Resource name="listUsersInUserOrganizations"/>
    <Resource name="patients" options={{label: "Patients"}} list={PatientList} icon={PatientIcon} create={PatientCreate}
              edit={PatientEdit} show={PatientShow}/>
    <Resource name="conversations" options={{label: "My Conversations"}} list={ConvoList}
              icon={ConvoIcon}/>
    <Resource
      name="presets"
      options={{ label: 'User Templates' }}
      icon={SettingsIcon}
      list={UserPresetList}
      create={UserPresetCreate}
      edit={UserPresetEdit}
      show={UserPresetShow}
    />
  </Admin>
);

export default App;