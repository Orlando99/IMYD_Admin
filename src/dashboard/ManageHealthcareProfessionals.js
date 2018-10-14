import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardActions, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import configs from '../js/configs';

import Avatar from 'material-ui/Avatar';

import HPIcon from 'material-ui/svg-icons/social/group';
import FlatButton from 'material-ui/FlatButton';
import ListIcon from 'material-ui/svg-icons/action/view-list';
import AddIcon from 'material-ui/svg-icons/content/add';
import AddGroupIcon from 'material-ui/svg-icons/social/group-add';

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
  cardHeader: { position: 'relative', width: 100, top: 30, left: -15, fontSize: '.9em', wordWrap: 'break-word', marginTop: 15 },
  cardNb: { position: 'relative', top: -10, left: 60, fontSize: '4em', padding: 5 },
  icon: { width: 100, height: 100, marginRight: -40, color: '#9ccd21' },
  actionIcon: { position: 'relative', width: 28, height: 28, marginLeft: '4px' },
  title: { width: 100, fontSize: '3em' },
  actions: { width: '100%', top: -7, padding: 0 },
  list: { maxHeight: 350, overflowY: 'auto' },
  body: { padding: 0 },
  buttonLeft: { fontSize: '.8em', width: '33%', height: '56px', borderTop: '1px solid #aaa', borderRight: '1px solid #aaa', marginRight: '0px ! important', padding: '7px', borderRadius: '0px', color: '#555' },
  buttonCenter: { fontSize: '.8em', width: '34%', height: '56px', borderTop: '1px solid #aaa', borderRight: '1px solid #aaa', marginRight: '0px ! important', padding: '7px', borderRadius: '0px', color: '#555' },
  buttonRight: { fontSize: '.8em', width: '33%', height: '56px', borderTop: '1px solid #aaa', marginRight: '0px ! important', padding: '7px', borderRadius: '0px', color: '#555' }
};

const HealthcareProfessionals = ({ nb, hp, title }) => (
  <Card style={styles.card}>
    <div style={styles.header}>
      <HPIcon style={styles.icon} />
      <div style={styles.cardNb}>
        {nb}
      </div>
      <div style={styles.cardHeader}>
        {title}
      </div>
    </div>
    <CardActions style={styles.actions}>
      <FlatButton id="hp-view-button" label={'View'} icon={<ListIcon style={styles.actionIcon} />} href="#/healthcareprofessionals" style={styles.buttonLeft} />
      <FlatButton id="hp-add-button" label={'Add'} icon={<AddIcon style={styles.actionIcon} />} href="#/healthcareprofessionals/create" style={styles.buttonCenter} />
      <FlatButton id="hp-bulkadd-button" label={'Bulk Add'} icon={<AddGroupIcon style={styles.actionIcon} />} href="#/userbulk/staff" style={styles.buttonRight} />
    </CardActions>
    <CardText style={styles.body} expandable={true}>
      <List style={styles.list}>
        {hp.map(record =>
          <ListItem style={styles.list} href={`#/healthcareprofessionals/${record.id}`} key={record.id} leftAvatar={<Avatar style={styles.avatar} src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`} />}>
            {record.firstName} {record.lastName}
          </ListItem>
        )}
      </List>
    </CardText>
  </Card>
);

HealthcareProfessionals.propTypes = {
  hp: PropTypes.array,
  nb: PropTypes.number,
  title: PropTypes.string,
  addTourSteps: PropTypes.func,
};

HealthcareProfessionals.defaultProps = {
  hp: [],
};

export default HealthcareProfessionals;
