import React from 'react';
import FlatButton from 'material-ui/FlatButton';

import ChatIcon from 'material-ui/svg-icons/social/people';

import { withRouter } from 'react-router-dom'

const ContactsButton = ({ record, history }) => {
  const handleTouchTap = () => {
    localStorage.setItem('IMYD.rosterPresetName', record.name);
    history.push({
      pathname: '/contactsroster',
      presetName: record.name,
      for: 'preset',
    });
  };
  const styles = {
    roster: {
      color: '#9ccd21',
      fill: '#9ccd21',
      minWidth: '30px',
      marginLeft: 10
    }
  };

  return (
    <div>
      <FlatButton
        style={styles.roster}
        icon={<ChatIcon/>}
        onClick={handleTouchTap}
        title="List Contacts"
        label=""
      />
    </div>
  );
}

export default withRouter(ContactsButton);
