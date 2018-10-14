import React from 'react';
import { Card, CardHeader } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import LightBulbIcon from 'material-ui/svg-icons/action/lightbulb-outline';

export default ({ style }) => (
    <Card style={style}>
        <CardHeader
            title={'Welcome to IMYD!'}
            subtitle={'Invite and manage Healthcare Professionals and Patients, view and manage Conversations, create Organization Managers and manage your own account. '}
            avatar={<Avatar backgroundColor="#FFEB3B" icon={<LightBulbIcon />} />}
        />
    </Card>
);
