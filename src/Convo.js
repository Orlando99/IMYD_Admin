// in src/convos.js
import _ from 'underscore';
import React from 'react';
import configs from './js/configs';

import {
  Filter,
  TextInput,
  ReferenceInput,
  SelectInput,
  List,
  Datagrid,
  EmailField,
  TextField,
  EditButton,
  ShowButton,
  Create,
  Edit,
  Show,
  SimpleShowLayout,
  SimpleForm,
  DisabledInput,
  DateInput,
  LongTextInput,
  ReferenceField,
  ReferenceManyField,
  DataGrid,
  DateField,
  required
} from 'admin-on-rest';

const ConvoFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Filter by ID" source="id"/>
    <TextInput label="Filter by Name" source="name" alwaysOn/>
    <TextInput label="Filter by Type" source="type"/>
  </Filter>
);

const ProfilePhotoField = ({record = {}}) => <img width="50px" height="50px" src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>;
ProfilePhotoField.defaultProps = {label: 'Name'};

const styles = {
  edit: { width: '8%', padding: '0px 5px' },
  show: { width: '9%', padding: '0px 5px' }
};

export const MessageList = (props) => (
  <List title="Conversations" {...props} filters={<ConvoFilter />}>
    <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
      <TextField source="rawBody"/>
    </Datagrid>
  </List>
);