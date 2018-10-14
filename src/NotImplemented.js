// in src/NotFound.js
import React, {Component} from 'react';
import { Card, CardText } from 'material-ui/Card';
import { ViewTitle } from 'admin-on-rest/lib/mui';
import ReportProblemIcon from 'material-ui/svg-icons/action/report-problem';

import { withRouter } from 'react-router-dom'

class NotImplemented extends Component {
  state = {};

  render() {
    return (
    <Card>
      <ViewTitle title="404 Page Not Yet Implemented"/>
      <CardText>
        <h1><ReportProblemIcon/>This page is under construction.</h1>
      </CardText>
    </Card>
    )
  }
};

export default withRouter(NotImplemented);