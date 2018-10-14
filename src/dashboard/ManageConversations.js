import React from 'react';
import { Card, CardActions, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import configs from '../js/configs';

import Avatar from 'material-ui/Avatar';

import ChatIcon from 'material-ui/svg-icons/communication/chat';
import FlatButton from 'material-ui/FlatButton';
import ListIcon from 'material-ui/svg-icons/action/view-list';

const styles = {
  card: { flex: '1', margin: '1em 1em 1em 1em', minWidth: 265, height: '13em'},
  header: {
    color: '#555',
    height: 100,
    padding: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardHeader: { position: 'relative', top: 30, left: -50, fontSize: '.9em' },
  cardNb: { position: 'relative', top: -10, left: 10, fontSize: '4em' },
  icon: { width: 100, height: 100, marginRight: 15, color: '#9ccd21' },
  actionIcon: { position: 'relative', width: 28, height: 28 },
  title: { width: 100, fontSize: '3em' },
  actions: { width: '100%', top: -7, padding: 0 },
  list: { maxHeight: 350, overflowY: 'auto' },
  body: { padding: 0 },
  buttonCenter: { width: '100%', height: '56px', borderTop: '1px solid #aaa', marginRight: '0px ! important', padding: '9px', borderRadius: '0px', color: '#555' },
};

export default ({ convos = [], nb, title, paging }) => (
  <Card style={styles.card}>
    <div style={styles.header}>
      <ChatIcon style={styles.icon}/>
      <div style={styles.cardNb}>
        {nb}
      </div>
      <div style={styles.cardHeader}>
        {title}
      </div>
    </div>
    <CardActions style={styles.actions}>
      <FlatButton label={'View'} icon={<ListIcon style={styles.actionIcon}/>} href="#/conversations" style={styles.buttonCenter}/>
      {/*<FlatButton label={'Add'} icon={<AddIcon style={styles.actionIcon}/>} href="#/healthcareprofessionals/create"  style={styles.buttonRight}/>*/}
    </CardActions>
    <CardText style={styles.body} expandable={true}>
      <List style={styles.list}>
        {convos.map(record =>
          <ListItem style={styles.list} href={`#/healthcareprofessionals/${record.id}`} key={record.id} leftAvatar={<Avatar style={styles.avatar} src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>}>
            {record.name}
          </ListItem>
        )}
      </List>
    </CardText>
  </Card>
);