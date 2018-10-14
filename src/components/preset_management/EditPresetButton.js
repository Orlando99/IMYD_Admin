import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import EditIcon from 'material-ui/svg-icons/image/edit';

import { withRouter } from 'react-router-dom'

const EditPresetButton = ({ record, history }) => {
  const handleTouchTap = () => history.push({
    pathname: `/presets/${record.id}`,
  });

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
        onClick={handleTouchTap}
        title="Edit User Template"
        label=""
      />
    </div>
  );
}

export default withRouter(EditPresetButton);
