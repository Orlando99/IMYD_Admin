import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui/Card';
import { LineChart, Line, XAxis, YAxis, Label, LabelList, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

const styles = {
  title: { color: '#666', fontSize: '2em', fontWeight: 500, padding: '20px 20px 10px 20px' },
  subTitle: { color: '#666', fontSize: '.9em', padding: '0 15px 15px 20px' },
  card: { flex: '1', margin: '0 2em' },
  icon: { float: 'right', width: 64, height: 64, padding: 16, color: '#ea952b' },
};

const UserStats = ({ title, am }) => (
  <Card id="user-stats" style={styles.card}>
    <div style={styles.title}>
      {title}
    </div>
    <div style={styles.subTitle}>
      Monitor weekly Sent vs. Read messages for my Organization (12 weeks)
    </div>
    <hr />
    <CardText>
      <ResponsiveContainer width='95%' height={400}>
        <LineChart data={am}>
          <XAxis style={{ color: '#f00' }} dataKey="week">
            <Label value="Week Starting" position="insideBottom" offset={-2} />
          </XAxis>
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="sent" stroke="#82ca9d" activeDot={{ r: 6 }}>
            <LabelList dataKey="sent" position="top" />
          </Line>
          <Line type="monotone" dataKey="read" stroke="#8884d8" activeDot={{ r: 8 }}>
            <LabelList dataKey="read" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </CardText>
  </Card>
);

UserStats.propTypes = {
  title: PropTypes.string,
  am: PropTypes.array,
};

export default UserStats;
