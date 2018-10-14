import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';

import ShowIcon from 'material-ui/svg-icons/image/remove-red-eye';

import { withRouter } from 'react-router-dom'

class ShowHPButton extends Component {
  handleTouchTap = () => {
    this.props.history.push({
      pathname: '/healthcareprofessionals/' + this.props.record.id + '/show',
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
          icon={<ShowIcon/>}
          onClick={() => this.handleTouchTap()}
          title="View User Profile"
          label=""
        />
      </div>
    );
  }
}

export default withRouter(ShowHPButton);