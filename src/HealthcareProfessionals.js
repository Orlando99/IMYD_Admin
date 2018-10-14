import React from 'react';
import moment from 'moment';
import compose from 'recompose/compose';
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
  SimpleForm,
  DateInput,
  Show,
  AutocompleteInput,
  SelectArrayInput,
  FunctionField,
  ReferenceArrayInput,
  NumberInput,
  BooleanInput,
  email,
  required,
  regex,
  Responsive,
} from 'admin-on-rest';

import ResetPasswordButton from './components/user_management/ResetPasswordButton';
import DisableButton from './components/user_management/DisableButton';
import ConvoButton from './components/user_management/ConvoButton';
import ShowHPButton from './components/user_management/ShowHPButton';
import RosterButton from './components/user_management/RosterButton';
import SecurityButton from './components/user_management/SecurityButton';

import {connect} from 'react-redux';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import Utility from "./js/utilities";

const HealthCareProfessionalFilter = (props) => (
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

const ProfilePhotoField = ({record = {}}) => <img width="50px" height="50px"
                                                  alt="Profile" src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>;
ProfilePhotoField.defaultProps = {label: 'Name'};

const HPTitle = ({record = {}}) => <span>Healthcare Professional: <span style={{fontWeight: 700}}>{record.userName.toUpperCase()}</span></span>;

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
  if (!values.zip) {
    errors.zip = msg;
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
  show: {width: '3%', padding: '0px 2px'},
  subAdmin: {paddingTop: '7px'},
  sectionTitle: {
    backgroundColor: 'rgb(156, 205, 33)',
    color: 'white',
    padding: '7px 10px',
    display: 'inline-block',
    width: '100%',
    boxSizing: 'border-box',
  },
};

const autocompleteOptions = {
  fullWidth: true,
  listStyle: styles.autocomplete,
  maxSearchResults: 5
};

const opts = {fullWidth: true};
const validatePhone = regex(/^\d{10}$/, 'Must be a valid phone number.');
const validateZipCode = regex(/^\d{5}$/, 'Must be a valid Zip Code');

const invitationMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'both', label: 'Both Email and SMS' },
];

const HPCreateBase = (props) => {
  const { firstName, lastName, change } = props;
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

  const onToggleNeverExpire = (e, newval, oldval) => {
    if (newval && !oldval) {
      change('expirationDate', null);
    }
  }

  return (
    <Create title="Create Healthcare Professional" {...props}>
      <SimpleForm validate={validateUserCreation} redirect="show">
        <div style={styles.sectionTitle}>Personal Details</div>
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
        <TextInput source="password" autoComplete='off' options={opts}/>
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
        <TextInput source="address" options={opts}/>
        <TextInput source="city" options={opts}/>
        <TextInput source="state" options={opts}/>
        <TextInput source="zip" validate={[required, validateZipCode]} options={opts}/>
        <br />
        <div style={styles.sectionTitle}>Account Details</div>
        <ReferenceInput label="Job Title" source="jobTitleId" reference="jobtitles" allowEmpty={true}
                        validation={{required: false}}>
          <AutocompleteInput options={autocompleteOptions}/>
        </ReferenceInput>
        <ReferenceInput label="Designation" source="designationId" reference="designations" allowEmpty={true}
                        validation={{required: false}}>
          <AutocompleteInput options={autocompleteOptions}/>
        </ReferenceInput>
        <TextInput label="Employee ID" source="employeeId" options={opts}/>
        <ReferenceInput label="Primary Network *" source="primaryNetwork" reference="facilities"
                        allowEmpty={true} validate={[required]}>
          <AutocompleteInput optionText="name" optionValue="name" options={autocompleteOptions}
                            validate={[required]}/>
        </ReferenceInput>
        <ReferenceArrayInput label="Secondary Networks" source="secondaryNetwork" reference="facilities"
                            allowEmpty={true}>
          <SelectArrayInput optionText="name" optionValue="name" options={opts}/>
        </ReferenceArrayInput>
        <Field
          label="Expiration Date"
          source="expirationDate"
          name="expirationDate"
          component={ConditionalDateInput}
          options={{ ...opts, minDate: new Date() }}
        />
        <BooleanInput
          label="Never expire?"
          source="neverExpire"
          onChange={onToggleNeverExpire}
          defaultValue={false}
        />
      </SimpleForm>
    </Create>
  );
}

// Decorate with redux-form
// Decorate with connect to read form values
const selector = formValueSelector('record-form'); // <-- same as form name

const ConditionalDateInputRendering = ({ disabled, source, options, ...rest }) => {
  // return React.cloneElement(children, { ...rest, options: { ...rest.options, hintText: 'Expiration Date', disabled } });
  return (
    <DateInput
      source={source}
      options={{ ...options, disabled }}
      {...rest}
    />
  );
}

const ConditionalDateInput = connect((state, props) => {
  return  {
      disabled: selector(state, 'neverExpire'),
  }
})(ConditionalDateInputRendering);


export const HPCreate = compose(
  connect(
    state => {
      let { firstName, lastName, neverExpire } = selector(state, 'firstName', 'lastName', 'neverExpire');
      if (firstName) {
        firstName = firstName.substr(0, 4);
      }
      if (lastName) {
        lastName = lastName.substr(0, 4);
      }
      return {
        firstName,
        lastName,
        neverExpire,
        state
      };
    }
  ),
  reduxForm({
    form: 'record-form', // a unique identifier for this form
    enableReinitialize: true,
  })
)(HPCreateBase);

export const HPEdit = (props) => (
  <Edit title={<HPTitle/>} {...props}>
    <SimpleForm validate={validateUserCreation} redirect="show">
      <div style={styles.sectionTitle}>Personal Details</div>
      <TextInput label="First Name" validate={[required]} source="firstName" options={opts}/>
      <TextInput label="Last Name" validate={[required]} source="lastName" options={opts}/>
      <TextInput label="Password (temporary override)" source="password" options={opts}/>

      <TextInput source="email" validate={[required, email]} options={opts}/>
      <TextInput source="phone" validate={[required, validatePhone]} options={opts}/>
      <TextInput source="city" options={opts}/>
      <TextInput source="state" options={opts}/>
      <TextInput source="zip" validate={[required, validateZipCode]} options={opts}/>
      <br />
      <div style={styles.sectionTitle}>Account Details</div>
      <NumberInput label="Employee ID" source="employeeId" options={opts}/>
      <ReferenceInput label="Job Title" source="jobTitleId" reference="jobtitles" allowEmpty={true}
                      validation={{required: false}}>
        <AutocompleteInput options={autocompleteOptions}/>
      </ReferenceInput>
      <ReferenceInput label="Designation" source="designationId" reference="designations" allowEmpty={true}
                      validation={{required: false}}>
        <AutocompleteInput options={autocompleteOptions}/>
      </ReferenceInput>
      <ReferenceInput label="Primary Network *" source="primaryNetwork" reference="facilities"
                      allowEmpty={true} validate={[required]}>
        <SelectInput optionText="name" optionValue="name" options={opts} validate={[required]}/>
      </ReferenceInput>
      <ReferenceArrayInput label="Secondary Networks" source="secondaryNetwork" reference="facilities"
                            allowEmpty={true}>
        <SelectArrayInput optionText="name" optionValue="name" options={opts}/>
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);

export const HPShow = (props) => (
  <Show title={<HPTitle/>} {...props}>
    <SimpleForm validate={validateUserCreation} toolbar={null}>
      <div style={styles.sectionTitle}>Personal Details</div>
      <TextField label="First Name"source="firstName" options={opts}/>
      <TextField label="Last Name" source="lastName" options={opts}/>
      <TextField source="userName" options={opts}/>
      <TextField source="email" options={opts}/>
      <TextField source="phone" options={opts}/>
      <TextField source="city" options={opts}/>
      <TextField source="state" options={opts}/>
      <TextField source="zip" options={opts}/>
      <br />
      <div style={styles.sectionTitle}>Account Details</div>
      <TextField label="Employee ID" source="employeeId" options={opts}/>
      <TextField source="jobTitle" options={opts}/>
      <TextField source="designation" options={opts}/>
      <TextField label="Primary Network" source="primaryNetwork" options={opts}/>
      <ReferenceArrayInput label="Secondary Networks" source="secondaryNetwork" reference="facilities"
                            allowEmpty={true}>
        <SelectArrayInput optionText="name" optionValue="name" options={{ disabled: true, readOnly: true}}/>
      </ReferenceArrayInput>
      <TextField label="User Type" source="userType"
                  options={opts}
      />
      <FunctionField source="userStatus" label="Status" render={record =>
        userStatsCalc(record)
      }/>
      <FunctionField source="lastMessageReadDate" label="Last Read" render={record =>
        record.lastMessageReadDate ? moment(record.lastMessageReadDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
      }/>
      <FunctionField source="lastMessageSentDate" label="Last Sent" render={record =>
        record.lastMessageSentDate ? moment(record.lastMessageSentDate, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
      }/>
    </SimpleForm>
  </Show>
);

const userStatsCalc = (record) => {
  let status = record.userStatus,
    read = record.lastMessageReadDate ? moment(record.lastMessageReadDate, 'YYYY-MM-DD HH:mm:ss Z') : '',
    sent = record.lastMessageSentDate ? moment(record.lastMessageSentDate, 'YYYY-MM-DD HH:mm:ss Z') : '',
    thirtyDaysAgo = moment().subtract(30, 'days');

  if(status !== 'Deactive' && status !== 'Blocked') {
    if(!record.loginActivity) {
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

export const HPList = (props) => (
  <Responsive
    small={
      <List title="Healthcare Professionals" {...props} filters={<HealthCareProfessionalFilter/>}
            sort={{field: 'lastName', order: 'asc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <FunctionField source="fullName" label="Name" render={record =>
            `${record.fullName} (${record.userName})`
          }/>
          {Utility.parseJWT().userType === "HOSPITAL_SUPER_ADMIN" &&
            <SecurityButton style={styles.action} />
          }
          <ShowHPButton style={styles.edit}/>
          <RosterButton style={styles.action} />
          <ConvoButton style={styles.action} />
          <ResetPasswordButton style={styles.action} />
          <DisableButton style={styles.actionRight} />
        </Datagrid>
      </List>
    }
    medium={
      <List title="Healthcare Professionals" {...props} filters={<HealthCareProfessionalFilter/>}
            sort={{field: 'lastName', order: 'asc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <ProfilePhotoField label="" source="username"/>
          <FunctionField source="fullName" label="Name" render={record =>
            `${record.fullName} (${record.userName})`
          }/>
          {Utility.parseJWT().userType === "HOSPITAL_SUPER_ADMIN" &&
            <SecurityButton style={styles.action} />
          }
          <FunctionField source="userType" label="User Role" render={record =>
            record.userType.toLowerCase().indexOf("hospital_admin") >= 0 ? 'SUB ADMIN' :
              record.userType.toLowerCase().indexOf("hospital_super_admin") >= 0 ? 'SUPER ADMIN' :
                record.userType.toLowerCase().indexOf("patient") >= 0 ? 'PATIENT' :
                  'STAFF'
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
          <ShowHPButton style={styles.action}/>
          <RosterButton style={styles.action} />
          {Utility.parseJWT().userType === "HOSPITAL_SUPER_ADMIN" &&
            <ConvoButton style={styles.action} />}

          <ResetPasswordButton style={styles.action} />
          <DisableButton style={styles.actionRight} />
        </Datagrid>
      </List>
    }
  />
);
