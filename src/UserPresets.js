import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  Filter,
  TextInput,
  LongTextInput,
  ReferenceInput,
  SelectInput,
  List,
  Datagrid,
  TextField,
  Create,
  Edit,
  SimpleForm,
  Show,
  required,
  Responsive,
  SimpleShowLayout,
} from 'admin-on-rest';
import { reduxForm } from 'redux-form';
import FlatButton from 'material-ui/FlatButton';
import ChatIcon from 'material-ui/svg-icons/social/people';

import ContactPickerDialog from './components/dialogs/ContactPickerDialog';

import ShowPresetButton from './components/preset_management/ShowPresetButton';
import ContactsButton from './components/preset_management/ContactsButton';
import EditPresetButton from './components/preset_management/EditPresetButton';
import DisableButton from './components/preset_management/DisableButton';

import Utility from './js/utilities';


const UserPresetFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Filter by Name" source="name" alwaysOn/>
  </Filter>
);

const UserPresetTitle = ({record = {}}) => <span>User Template: #<span style={{fontWeight: 700}}>{record.name}</span></span>;

const ContactsInput = ({ input: { value } }) => (
  <span>{(value || []).map(c => c.userName).join(', ')}</span>
);

ContactsInput.defaultProps = {
  addLabel: true,
  addField: true, // require a <Field> decoration
}

const validateUserPresetCreation = (values) => {
  const errors = {}, msg = 'Required';
  if (!values.name) {
    errors.name = msg;
  }
  if (!values.hospId) {
    errors.hospId = msg;
  }
  if (!values.sender) {
    errors.sender = msg;
  }
  if (!values.welcomeMessage) {
    errors.welcomeMessage = msg;
  }
  if (values.welcomeMessage && values.welcomeMessage.length > 2000) {
    errors.welcomeMessage = 'This message is too long. Please shorten it to less than 2000 characters and try again.';
  }
  return errors
};

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

class UserPresetCreateBasic extends Component {

  componentWillReceiveProps(nextProps) {
    if ((!this.props.orgs || this.props.orgs.length === 0) && nextProps.orgs &&
      nextProps.orgs.length === 1) {
        this.props.change('hospId', nextProps.orgs[0].pk.id);
    }
  }

  onUpdateContactsList = (list) => this.props.change('initialContacts', list.map(c => ({ userName: c })))

  openContactsDialog = () => this.dialogRef.openDialog()

  setDialogRef = (ref) => this.dialogRef = ref

  render() {
    const currentUser = Utility.parseJWT();
    const { orgs } = this.props;
    return (
      <Create title="New User Template" {...this.props}>
        <SimpleForm validate={validateUserPresetCreation} redirect="list">
          <TextInput label="Name" validate={[required]} source="name" options={opts}/>
          <ReferenceInput
            label="Organization"
            source="hospId"
            defaultValue={orgs && orgs.length === 1 ? orgs[0].name : ''}
            reference="facilities"
            allowEmpty
            validate={[required]}
          >
            <SelectInput validate={[required]} optionText="name" optionValue="pk.id" options={opts}/>
          </ReferenceInput>
          <ReferenceInput
            label="Welcome Message Sender Username"
            source="sender.userName"
            defaultValue={currentUser ? currentUser.userName : ''}
            reference="listUsersInUserOrganizations"
            allowEmpty
            validate={[required]}
          >
            <SelectInput validate={[required]} optionText="userName" optionValue="userName" options={opts}/>
          </ReferenceInput>
          <LongTextInput label="Welcome Message Text" validate={[required]} source="welcomeMessage" options={opts}/>
          <ContactsInput label="Initial Contact List" source="initialContacts" style={{ marginBottom: 20 }} />
          <FlatButton
            icon={<ChatIcon />}
            onClick={this.openContactsDialog}
            title="Browse & Pick Initial Contact List"
            label="Pick Contacts"
          />
          <ContactPickerDialog
            ref={this.setDialogRef}
            open={false}
            onSubmit={this.onUpdateContactsList}
          />
        </SimpleForm>
      </Create>
    )
  }
}

// Decorate with redux-form
export const UserPresetCreate = connect(state => ({
  orgs: _.values((state.admin.resources.facilities || {}).data) || [],
}))(reduxForm({ form: 'record-form' })(UserPresetCreateBasic));

class UserPresetEditBasic extends Component {

  onUpdateContactsList = (list) => this.props.change('initialContacts', list.map(c => ({ userName: c })))

  openContactsDialog = () => this.dialogRef.openDialog()

  setDialogRef = (ref) => this.dialogRef = ref

  render() {
    return (
      <Edit title={<UserPresetTitle/>} {...this.props}>
        <SimpleForm validate={validateUserPresetCreation} redirect="show">
          <TextInput label="Name" validate={[required]} source="name" options={opts}/>
          <ReferenceInput
            label="Organization"
            source="hospId"
            reference="facilities"
            allowEmpty
            validate={[required]}
          >
            <SelectInput validate={[required]} optionText="name" optionValue="pk.id" options={opts}/>
          </ReferenceInput>
          <ReferenceInput
            label="Welcome Message Sender Username"
            source="sender.userName"
            reference="listUsersInUserOrganizations"
            allowEmpty
            validate={[required]}
          >
            <SelectInput validate={[required]} optionText="userName" optionValue="userName" options={opts}/>
          </ReferenceInput>
          <LongTextInput label="Welcome Message Text" validate={[required]} source="welcomeMessage" options={opts}/>
          <ContactsInput label="Initial Contact List" source="initialContacts" style={{ marginBottom: 20 }} />
          <FlatButton
            icon={<ChatIcon />}
            onClick={this.openContactsDialog}
            title="Browse & Pick Initial Contact List"
            label="Pick Contacts"
          />
          <ContactPickerDialog
            ref={this.setDialogRef}
            open={false}
            onSubmit={this.onUpdateContactsList}
          />
        </SimpleForm>
      </Edit>
    );
  }
}

export const UserPresetEdit = reduxForm({ form: 'record-form' })(UserPresetEditBasic);

export const UserPresetShow = (props) => {
  return (
    <Show title={<UserPresetTitle/>} {...props}>
      <SimpleShowLayout>
        <TextField label="Name" source="name" options={opts}/>
        <TextField label="Organization" source="hospName" options={opts}/>
        <TextField label="Welcome Message Sender Username" source="sender.userName" options={opts} />
        <TextField label="Welcome Message Text" source="welcomeMessage" options={opts}/>
      </SimpleShowLayout>
    </Show>
  );
}

export const UserPresetList = (props) => {
  const isSuperAdmin = Utility.parseJWT().userType === 'HOSPITAL_SUPER_ADMIN';
  const newProps = {
    ...props,
    hasCreate: isSuperAdmin,
    hasEdit: isSuperAdmin,
    hasDelete: isSuperAdmin,
  };
  return (
    <Responsive
      small={
        <List title="User Templates" {...newProps} filters={<UserPresetFilter/>}
              sort={{field: 'name', order: 'asc'}}>
          <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
            <TextField source="name" label="Name" />
            <TextField source="hospName" label="Organization" />
            <TextField source="sender.userName" label="Sender" />
            <ShowPresetButton style={styles.action}/>
            <ContactsButton style={styles.action} />
            {isSuperAdmin && <EditPresetButton style={styles.action} />}
            {isSuperAdmin && <DisableButton style={styles.actionRight} />}
          </Datagrid>
        </List>
      }
      medium={
        <List title="User Templates" {...newProps} filters={<UserPresetFilter/>}
              sort={{field: 'name', order: 'asc'}}>
          <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
            <TextField source="name" label="Name" />
            <TextField source="hospName" label="Organization" />
            <TextField source="sender.userName" label="Sender" />
            <TextField source="welcomeMessage" label="Welcome Message" />
            <ShowPresetButton style={styles.action} />
            <ContactsButton style={styles.action} />
            {isSuperAdmin && <EditPresetButton style={styles.action} />}
            {isSuperAdmin && <DisableButton style={styles.actionRight} />}
          </Datagrid>
        </List>
      }
    />
  );
}
