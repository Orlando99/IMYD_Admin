// in src/convos.js
import React from 'react';
import configs from './js/configs';
import ShowConvoButton from './components/user_management/ShowConvoButton';

import moment from 'moment';
import Utility from "./js/utilities";

import {
  Filter,
  TextInput,
  List,
  Datagrid,
  TextField,
  FunctionField,
  Responsive
} from 'admin-on-rest';

const ConvoFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Filter by ID" source="id"/>
    <TextInput label="Filter by Name" source="name" alwaysOn/>
    <TextInput label="Filter by Type" source="type"/>
  </Filter>
);

const ProfilePhotoField = ({record = {}}) => <img width="50px" height="50px" alt="Profile"
                                                  src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>;
ProfilePhotoField.defaultProps = {label: 'Name'};

const MembersField = ({record = {}}) => <div>{record.users ? record.users.map(u => u.username)
  .join(', ') : ''}</div>;
MembersField.defaultProps = { label: 'Members' };

const styles = {
  edit: {width: '8%', padding: '0px 5px'},
  show: {width: '9%', padding: '0px 5px'},
  showHead: {height: '100px'},
  detail: {display: 'inline-block', verticalAlign: 'top', marginRight: '2em', minWidth: '8em'},
  cardActionStyle: {
    zIndex: 2,
    display: 'inline-block',
    float: 'right',
  }
};

export const ConvoList = (props) => (
  <Responsive
    small={
      <List title="My Conversations" {...props} filters={<ConvoFilter/>} sort={{field: 'id', order: 'desc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <TextField source="naturalName" label="Name" />
          <FunctionField source="type" render={record => record.type === 'ONE_TO_ONE' ? 'direct' : 'group' } />
          <MembersField source="users"/>
          <ShowConvoButton source="name" type="myconversations" style={styles.show} label=""/>
        </Datagrid>
      </List>
    }
    medium={
      <List title="My Conversations" {...props} filters={<ConvoFilter/>} sort={{field: 'id', order: 'desc'}}>
        <Datagrid bodyOptions={{stripedRows: true, showRowHover: true}}>
          <TextField source="naturalName" label="Name" />
          <FunctionField source="type" render={record => record.type === 'ONE_TO_ONE' ? 'direct' : 'group' } />
          <MembersField source="users"/>
          <FunctionField source="id" label="Latest Message" render={record =>
            moment(record.lastMessage.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT)
          }/>
          <ShowConvoButton source="name" type="myconversations" style={styles.show} label=""/>
        </Datagrid>
      </List>
    }
  />
);