import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';

import ChatIcon from 'material-ui/svg-icons/social/people';

import { withRouter } from 'react-router-dom'

class RosterButton extends Component {
  handleTouchTap = () => {
    this.props.history.push({
      pathname: '/userroster',
      userName: this.props.record.userName
    });
    localStorage.setItem('IMYD.rosterUsername', this.props.record.userName ? this.props.record.userName : this.props.record.username);
  };

  render() {
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
          onClick={() => this.handleTouchTap()}
          title="List User Contacts"
          label=""
        />
      </div>
    );
  }
}

export default withRouter(RosterButton);