import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';

import {
  GET_LIST,
  Responsive,
  List,
  Datagrid,
  TextField,
  ShowButton,
  FunctionField,
  TextInput,
  Filter,
  props
} from 'admin-on-rest';
import EditIcon from 'material-ui/svg-icons/image/edit';

import { withRouter } from 'react-router-dom'

class EditHPButton extends Component {
  constructor(props) {
    super(props);
  }

  handleTouchTap = () => {
    this.props.history.push({
      pathname: '/healthcareprofessionals/' + this.props.record.id,
      username: this.props.record.username
    });
    localStorage.setItem('IMYD.rosterUsername', this.props.record.username);
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
          icon={<EditIcon/>}
          onClick={() => this.handleTouchTap()}
          title="Edit User Profile"
          label=""
        />
      </div>
    );
  }
}

export default withRouter(EditHPButton);