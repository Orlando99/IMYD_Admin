import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import ShowIcon from 'material-ui/svg-icons/image/remove-red-eye';

import { withRouter } from 'react-router-dom';

const ShowPresetButton = ({ record, history }) => {
  const handleTouchTap = () => history.push({
    pathname: `/presets/${record.id}/show`,
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
        icon={<ShowIcon/>}
        onClick={handleTouchTap}
        title="View User Template"
        label=""
      />
    </div>
  );
};

export default withRouter(ShowPresetButton);