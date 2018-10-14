// in src/NotFound.js
import React from 'react';
import { Card, CardText } from 'material-ui/Card';
import { ViewTitle } from 'admin-on-rest/lib/mui';

export default () => (
  <Card>
    <ViewTitle title="404 Not Found" />
    <CardText>
      <h1>404 Error: Either the page could not be found or this option does not exist.</h1>
    </CardText>
  </Card>
);