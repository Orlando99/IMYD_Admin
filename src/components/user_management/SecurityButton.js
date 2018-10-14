import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import restClient from '../../IMYD-REST-Client';
import SecurityIcon from 'material-ui/svg-icons/hardware/security';
import PersonIcon from 'material-ui/svg-icons/social/person';
import Snackbar from 'material-ui/Snackbar';

class SecurityButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 1000,
      message: '',
      open: false,
      user_type: this.props.record.userType
    };
  }

  componentWillMount() {
    this.setState({
      message: ''
    });
  }

  handleTouchTap = () => {
    const type = this.state.user_type;
    let coUserType = type === "HOSPITAL_ADMIN" ? "STAFF" : "HOSPITAL_ADMIN";
    restClient('CHANGE_USER_TYPE', 'changeUserType', {
      userName: this.props.record.userName,
      coUserType
    })
      .then(result => {
        this.setState({
          open: true,
          message: type === 'STAFF'  ? `User ${this.props.record.userName} Promoted to Sub-Admin` : `User ${this.props.record.userName} Demoted to Staff`
        });
      });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
    setTimeout(() => window.location.reload(), 200);
  };

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
    return (
      <div>
        <FlatButton
          style={this.state.user_type.indexOf('Admin') >= 0 ? styles.disable : styles.enable}
          icon={this.state.user_type === 'HOSPITAL_ADMIN' ? <PersonIcon/> : <SecurityIcon/>}
          onClick={() => this.handleTouchTap()}
          title={this.state.user_type === 'HOSPITAL_ADMIN' ? "Demote to Staff" : "Promote to Sub-Admin"}
          label=""
        />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default SecurityButton;