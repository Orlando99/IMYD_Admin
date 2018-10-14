import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import restClient from '../../IMYD-REST-Client';
import { DELETE } from 'admin-on-rest';
import ActionDisable from 'material-ui/svg-icons/action/highlight-off';
import Snackbar from 'material-ui/Snackbar';

class DisableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 1000,
      open: false,
      message: '',
    };
  }

  handleTouchTap = () => {
    restClient(DELETE, 'presets', {
      id: this.props.record.id,
    })
      .then(result => {
        this.setState({
          open: true,
          message: `Template '${this.props.record.name}' Removed`,
        });
      });
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
    setTimeout(() => window.location.reload(), 200);
  }

  render() {
    const styles = {
      color: "red",
      fill: "red",
      minWidth: '30px',
      marginLeft: 10,
    };
    const { open, message, autoHideDuration } = this.state;
    return (
      <div>
        <FlatButton
          style={styles}
          icon={<ActionDisable/>}
          onClick={this.handleTouchTap}
          title="Remove User Template"
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