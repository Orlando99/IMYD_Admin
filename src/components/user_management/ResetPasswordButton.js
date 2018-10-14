import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import restClient from '../../IMYD-REST-Client';
import {
  UPDATE
} from 'admin-on-rest';
import Snackbar from 'material-ui/Snackbar';
import CommLinkLock from 'material-ui/svg-icons/communication/phonelink-lock';

class ResetPasswordButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 5000,
      message: '',
      open: false
    };
  }

  componentWillMount() {
    this.setState({
      message: this.state.user_status === 'Active' ? 'User Disabled' : 'User Enabled'
    });
  }

  handleTouchTap = () => {
    restClient(UPDATE, 'resetUserPassword', {
      id: this.props.record.username ? this.props.record.username : this.props.record.userName
    })
      .then(result => {
        // console.log(result, this.state.email);
        this.setState({
          open: true,
          message: `Password Reset and email sent to '${this.props.record.username ? this.props.record.username : this.props.record.userName}'`,
          user_status: ''
        });
      });
  };

  handleActionTouchTap = () => {
    this.setState({
      open: false,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const styles = {
      reset: {
        color: '#9ccd21',
        fill: '#9ccd21',
        minWidth: '30px',
        marginLeft: 10
      }
    };

    return (
      <div>
        <FlatButton
          style={styles.reset}
          icon={<CommLinkLock/>}
          onClick={() => this.handleTouchTap()}
          title="Reset Password"
          label=""
        />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          action="OK"
          onActionTouchTap={this.handleActionTouchTap}
        />
      </div>
    );
  }
}

export default ResetPasswordButton;