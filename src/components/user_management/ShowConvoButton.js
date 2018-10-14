import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import ShowIcon from 'material-ui/svg-icons/image/remove-red-eye';

import {withRouter} from 'react-router-dom'

class ShowConvoButton extends Component {
  state = {};

  handleTouchTap = () => {
    this.props.history.push({
      pathname: `/orguserconvos/${this.props.type}`,
      record: this.props
    });
    let id, username, fullname, name, updated, type;

    if(this.props.type === 'userconversations') {
      id = this.props.id;
      username = this.props.username;
      fullname = this.props.data.type === 'ONE_TO_ONE' ? this.props.name
        : this.props.data.naturalName;
      name = this.props.data.type === 'ONE_TO_ONE' ? this.props.data.users[0].username
        : this.props.data.name;
      updated = this.props.data.lastMessage.timestamp;
      type = this.props.data.type;
    } else {
      id = this.props.record.id;
      username = this.props.record.type === 'ONE_TO_ONE' ? this.props.record.users[0].username
        : this.props.record.name;
      name = this.props.record.naturalName;
      updated = this.props.record.lastMessage.timestamp;
      type = this.props.record.type;
    }
    localStorage.setItem('IMYD.orgUserConvoRecord', JSON.stringify({id, username, fullname, name, updated, type}));
  };

  render() {
    const styles = {
      convo: {
        color: '#9ccd21',
        fill: '#9ccd21',
        minWidth: '30px',
        marginLeft: 10
      },
      convoDisabled: {
        color: '#ccc',
        fill: '#9ccd21',
        minWidth: '30px',
        marginLeft: 10
      }
    };

    return (
      <div>
        <FlatButton
          style={styles.convo}
          icon={<ShowIcon/>}
          onClick={() => this.handleTouchTap()}
          title={"List User Conversations"}
          label=""
        />
      </div>
    );
  }
}

export default withRouter(ShowConvoButton);