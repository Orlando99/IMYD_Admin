import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import restClient from '../../IMYD-REST-Client';
import {
  UPDATE
} from 'admin-on-rest';
import ActionDisable from 'material-ui/svg-icons/action/highlight-off';
import ActionEnable from 'material-ui/svg-icons/action/done';
import Snackbar from 'material-ui/Snackbar';

class DisableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 1000,
      message: '',
      open: false,
      user_status: this.props.record.userStatus
    };
  }

  componentWillMount() {
    this.setState({
      message: this.state.user_status === 'Active' ? 'User Disabled' : 'User Enabled'
    });
  }

  handleTouchTap = () => {
    const status = this.state.user_status;
    restClient(UPDATE, 'toggleUserStatus', {
      id: this.props.record.userName ? this.props.record.userName : this.props.record.username
    })
      .then(result => {
        this.setState({
          open: true,
          message: status === 'Active' ? `User ${this.props.record.userName ? this.props.record.userName : this.props.record.username} Disabled` : `User ${this.props.record.userName ? this.props.record.userName : this.props.record.username} Enabled`,
          user_status: status === 'Active' ? 'Deactive' : 'Active'
        });
      });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
    setTimeout(() => window.location.reload(), 200);
  };

  getTooltip = (status) => {
    switch (status) {
      case 'Deactive':
        return 'Enable User Account';
      case 'Blocked':
        return 'Unblock User Account';
      default:
        return 'Disable User Account';
    }
  }

  render() {
    const styles = {
      enable: {
        color: '#9ccd21',
        fill: '#9ccd21',
        minWidth: '30px',
        marginLeft: 10
      },
      disable: {
        color: "red",
        fill: "red",
        minWidth: '30px',
        marginLeft: 10
      }
    };
    const { user_status, open ,message, autoHideDuration } = this.state;
    return (
      <div>
        <FlatButton
          style={user_status === 'Active' ? styles.disable : styles.enable}
          icon={user_status === 'Active' ? <ActionDisable/> : <ActionEnable/>}
          onClick={() => this.handleTouchTap()}
          title={this.getTooltip(user_status)}
          label=""
        />
        <Snackbar
          open={open}
          message={message}
          autoHideDuration={autoHideDuration}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default DisableButton;