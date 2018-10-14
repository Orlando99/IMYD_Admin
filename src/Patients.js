import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import configs from './js/configs';

import restClient from './IMYD-REST-Client';

import {
  Filter,
  TextInput,
  ReferenceInput,
  SelectInput,
  List,
  Datagrid,
  TextField,
  Create,
  Edit,
  TabbedForm,
  FormTab,
  Show,
  FunctionField,
  email,
  required,
  regex,
  Responsive,
} from 'admin-on-rest';

import ResetPasswordButton from './components/user_management/ResetPasswordButton';
import DisableButton from './components/user_management/DisableButton';
import ShowPatientButton from './components/user_management/ShowPatientButton';
import RosterButton from './components/user_management/RosterButton';

import {connect} from 'react-redux'
import {reduxForm, formValueSelector} from 'redux-form'
import Utility from "./js/utilities";

const PatientFilter = (props) => (
  <Filter {...props}>
    <SelectInput label="Preset Filters" source="userType" choices={[
      {id: 'userType:', name: 'ALL'},
      {id: 'userType:ADMIN', name: 'ADMINS'},
      {id: 'userStatus:DEACTIVE', name: 'DISABLED'}
    ]} alwaysOn/>
    <TextInput label="Filter by Username" source="username" alwaysOn/>
    <TextInput label="Filter by Last Name" source="lastName"/>
    <TextInput label="Filter by First Name" source="firstName"/>
    <TextInput label="Filter by City" source="city"/>
    <SelectInput label="Filter by Status" source="userStatus" choices={[
      {id: 'userStatus:Active', name: 'Active/Inactive/NLI'},
      {id: 'userStatus:Deactive', name: 'Disabled'},
      {id: 'userStatus:Blocked', name: 'Blocked'},
    ]} />
  </Filter>
);

const ProfilePhotoField = ({record = {}}) => <img width="50px" height="50px" alt="Profile"
                                                  src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>;
ProfilePhotoField.defaultProps = {label: 'Name'};

const PatientTitle = ({record = {}}) => <span>Patient: #<span style={{fontWeight: 700}}>{record.id}</span></span>;

const validateUserCreation = (values) => {
  const errors = {}, msg = 'Required';
  if (!values.userName) {
    errors.userName = msg;
  }
  if (!values.firstName) {
    errors.firstName = msg;
  }
  if (!values.lastName) {
    errors.lastName = msg;
  }
  if (!values.phone) {
    errors.phone = msg;
  }
  if (!values.email) {
    errors.email = msg;
  }
  return errors
};

const noSpace = value => value && value.indexOf(' ') >= 0 ? 'Must not contain spaces or special characters' : undefined;

const styles = {
  autocomplete: {width: 'auto'},
  field: {width: '200%'},
  detail: {display: 'inline-block', verticalAlign: 'top', marginRight: '2em', minWidth: '8em'},
  action: {width: '3%', padding: '0px 2px'},
  actionRight: {width: '2%', padding: '0px 8px 0px 2px'},
  edit: {width: '3%', padding: '0px 0px'},
  show: {width: '3%', padding: '0px 2px'}
};

const opts = {fullWidth: true};
const validatePhone = regex(/^\d{10}$/, 'Must be a valid Phone Number.');
const validateZipCode = regex(/^\d{5}$/, 'Must be a valid Zip Code');

const invitationMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'both', label: 'Both Email and SMS' },
];

export let PatientCreate = (props) => {
  const {
    firstName, lastName, change
  } = props;

  this.firstName = firstName;
  this.lastName = lastName;

  const buildUserName = _.debounce((prefix, suffix) => {
    let userName = `${prefix.toLowerCase()}${suffix.toLowerCase()}`;
    if(userName) {
      validateUser(userName);
    }
  }, 500);

  const validateUser = (userName) => restClient('GET_USER', `users/${userName}/usernameExists`)
    .then(result => change('userName', result || userName));

  return (
    <Create title="Create Patient" {...props}>
      <TabbedForm validate={validateUserCreation} redirect="show" >
        <FormTab label="Personal Details">
          <TextInput name="firstName" label="First Name" validate={[required]} source="firstName" options={opts}
                     onChange={(event, newValue, previousValue) => {
                       buildUserName(newValue.substr(0,4), this.lastName || '');
                     }}
          />
          <TextInput name="lastName" label="Last Name" validate={[required]} source="lastName" options={opts}
                     onChange={(event, newValue, previousValue) => {
                       buildUserName(this.firstName || '', newValue.substr(0,4));
                     }}
          />
          <TextInput
            source="userName"
            validate={[required, noSpace]}
            options={opts}
            autoComplete="off"
            onChange={(event, newValue, previousValue) => {
              buildUserName(newValue || '', '');
            }}
          />
          <TextInput source="email" validate={[required, email]} options={opts}/>
          <TextInput source="phone" validate={[required, validatePhone]} options={opts}/>
          <SelectInput
            source="invitation_method"
            choices={invitationMethodOptions}
            optionText="label"
            optionValue="value"
            validate={[required]}
            options={opts}
          />
          <TextInput source="city" options={opts}/>
          <TextInput source="state" options={opts}/>
          <TextInput source="zip" validate={validateZipCode} options={opts}/>
          <TextInput label="MRN" source="mrn" options={opts}/>
          <ReferenceInput
            label="Apply User Template"
            source="nppId"
            reference="presets"
            allowEmpty
          >
            <SelectInput validate={[required]} optionText="name" optionValue="id" options={opts}/>
          </ReferenceInput>
        </FormTab>
      </TabbedForm>
    </Create>
  );
}

export const PatientEdit = (props) => (
  <Edit title={<PatientTitle/>} {...props}>
    <TabbedForm validate={validateUserCreation} redirect="show">
      <FormTab label="Personal Details">
        <TextInput label="First Name" validate={[required]} source="firstName" options={opts}/>
        <TextInput label="Last Name" validate={[required]} source="lastName" options={opts}/>
        <TextInput label="Password (temporary override)" source="password" options={opts}/>

        <TextInput source="email" validate={[required, email]} options={opts}/>
        <TextInput source="phone" validate={[required, validatePhone]} options={opts}/>
        <TextInput source="city" options={opts}/>
        <TextInput source="state" options={opts}/>
        <TextInput source="zip" validate={validateZipCode} options={opts}/>
      </FormTab>
      <FormTab label="Account Details">
        <TextInput label="MRN" source="mrn" options={opts}/>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const PatientShow = (props) => {
  return (
    <Show title={<PatientTitle/>} {...props}>
      <TabbedForm validate={validateUserCreation} toolbar={null}>
        <FormTab label="Personal Details">
          <TextField label="First Name" source="firstName" options={opts}/>
          <TextField label="Last Name" source="lastName" options={opts}/>
          <TextField source="userName" options={opts}/>
          <TextField source="email" options={opts}/>
          <TextField source="phone" options={opts}/>
          <TextField source="city" options={opts}/>
          <TextField source="state" options={opts}/>
          <TextField source="zip" options={opts}/>
        </FormTab>
        <FormTab label="Account Details">
          <TextField label="MRN" source="mrn" options={opts}/>
          <FunctionField source="userStatus" label="Status" render={record =>
            userStatsCalc(record)
          }/>
          <FunctionField source="lastMessageReadDate" label="Last Read" render={record =>
            record.lastMessageReadDate ? moment(record.lastMessageReadDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
          }/>
          <FunctionField source="lastMessageSentDate" label="Last Sent" render={record =>
            record.lastMessageSentDate ? moment(record.lastMessageSentDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
          }/>
        </FormTab>
      </TabbedForm>
    </Show>
  );
}

const userStatsCalc = (record) => {
  let status = record.userStatus,
    read = record.lastMessageReadDate ? moment(record.lastMessageReadDate, 'YYYY-MM-DD HH:mm:ss Z') : '',
    sent = record.lastMessageSentDate ? moment(record.lastMessageSentDate, 'YYYY-MM-DD HH:mm:ss Z') : '',
    thirtyDaysAgo = moment().subtract(30, 'days');

  if(status !== 'Deactive' && status !== 'Blocked') {
    if(read === '' && sent === '') {
      status = 'NLI';
    } else if(((read || sent) && read > thirtyDaysAgo) || sent > thirtyDaysAgo ) {
      status = 'Active';
    } else {
      status = 'Inactive';
    }
  } else if (status === 'Deactive') {
    status = 'Disabled';
  }
  return status;
};

export const PatientList = (props) => (
  <Responsive
    small={
      <List title="Patients" {...props} filters={<PatientFilter/>}
            sort={{field: 'lastName', order: 'asc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <FunctionField source="fullName" label="Name" render={record =>
            `${record.fullName} (${record.userName})`
          }/>
          <ShowPatientButton style={styles.edit}/>
          <RosterButton style={styles.action} label="" source="userStatus"/>
          <ResetPasswordButton style={styles.action} label="" source="userStatus"/>
          <DisableButton style={styles.actionRight} label="" source="userStatus"/>
        </Datagrid>
      </List>
    }
    medium={
      <List title="Patients" {...props} filters={<PatientFilter/>}
            sort={{field: 'lastName', order: 'asc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <ProfilePhotoField label="" />
          <FunctionField source="fullName" label="Name" render={record =>
            `${record.fullName} (${record.userName})`
          }/>
          <FunctionField source="userStatus" label="Status" render={record =>
            userStatsCalc(record)
          }/>
          <FunctionField source="lastMessageReadDate" label="Last Read" render={record =>
            record.lastMessageReadDate ? moment(record.lastMessageReadDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
          }/>
          <FunctionField source="lastMessageSentDate" label="Last Sent" render={record =>
            record.lastMessageSentDate ? moment(record.lastMessageSentDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
          }/>
          <ShowPatientButton style={styles.action}/>
          <RosterButton style={styles.action} />
          <ResetPasswordButton style={styles.action} />
          <DisableButton style={styles.actionRight} />
        </Datagrid>
      </List>
    }
  />
);


// Decorate with redux-form
PatientCreate = reduxForm({
  form: 'record-form' // a unique identifier for this form
})(PatientCreate);

// Decorate with connect to read form values
const selector = formValueSelector('record-form'); // <-- same as form name
PatientCreate = connect(
  state => {
    let {firstName, lastName} = selector(state, 'firstName', 'lastName');
    if (firstName) {
      firstName = firstName.substr(0, 4);
    }
    if (lastName) {
      lastName = lastName.substr(0, 4);
    }
    return {
      firstName,
      lastName,
      state
    };
  }
)(PatientCreate);
