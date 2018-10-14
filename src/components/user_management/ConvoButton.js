import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';

import ChatIcon from 'material-ui/svg-icons/communication/chat';

import { withRouter } from 'react-router-dom'

class ConvoButton extends Component {
  handleTouchTap = () => {
    this.props.history.push({
      pathname: '/userconvos',
      username: this.props.record.userName
    });
    localStorage.setItem('IMYD.convoUsername', JSON.stringify({username: this.props.record.userName ? this.props.record.userName : this.props.record.username, name: this.props.record.firstName + ' ' + this.props.record.lastName}));
  };

  render() {
    const styles = {
      convo: {
        color: '#9ccd21',
        fill: '#9ccd21',
        minWidth: '30px',
        marginLeft: 10
      }
    };

    return (
      <div>
        <FlatButton
          style={styles.convo}
          icon={<ChatIcon/>}
          onClick={() => this.handleTouchTap()}
          title="List User Conversations"
          label=""
        />
      </div>
    );
  }
}

export default withRouter(ConvoButton);