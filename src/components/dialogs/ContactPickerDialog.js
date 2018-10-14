import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Grid, Row, Col } from 'react-flexbox-grid';
import update from 'immutability-helper';

import {
  GET_LIST
} from 'admin-on-rest';

import CircularProgress from 'material-ui/CircularProgress';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import TextFieldInput from 'material-ui/TextField';
import AddIcon from 'material-ui/svg-icons/content/add-circle';
import SubtractIcon from 'material-ui/svg-icons/content/remove-circle';

import restClient from '../../IMYD-REST-Client';

const styles = {
  dialogTitleStyle: {
    borderBottom: '1px solid #ddd',
  },
  displayCount: {
    lineHeight: '5px',
    fontSize: '10px',
    width: '100%',
    textAlign: 'right'
  },
  row: {
    padding: '0px 5px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    width: '100%',
  },
  rowChecked: {
    padding: '0px 5px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    backgroundColor: 'rgba(205, 230, 144, 0.4)',
    width: '100%',
  },
  actionIcon: {
    color: '#9ccd21',
    fill: '#9ccd21',
    fontWeight: 100
  },
  actionText: {
    color: '#9ccd21'
  },
  'sm-spacing': {
    paddingTop: '3px'
  },
  'md-spacing': {
    padding: '5px'
  },
  'lg-spacing': {
    paddingTop: '7px'
  },
  textCenter: {
    textAlign: 'center',
  },
};

const OrgsField = ({record = {}}) => (
  <div>
    {(record.organizations || []).map((org, i) => (
      <div
        key={i}
        data-id={record.userName}
        style={{
          width: 'fit-content',
          margin: '3px',
          borderRadius: '4px 8px',
          backgroundColor: '#9ccd21',
          padding: '5px',
          fontSize: '12px',
          color: '#fff'
        }}
      >
        {org.name}
      </div>
    ))}
  </div>
);

export default class ContactPickerDialog extends Component {
  static propTypes = {
    username: PropTypes.string,
    open: PropTypes.bool,
    onSubmit: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.NUM_RECORDS = 400;
    this.state = {
      dialogOpen: props.open || false,
      contacts: [],
      buildOrgs: [],
      dialogData: [],
      reserveData: [],
      infinite: {
        hasMore: true,
      },
    };
  }

  componentDidMount() {
    this.loadData();
  }

  handleOrgAutoUpdateInput = (value) => {
    const { reserveData, buildOrgs, dialogFilterText } = this.state;

    this.handleDeselectAll();

    if (value && value.length >= 3 && !!value.trim()) {

      if (value !== dialogFilterText) {
        // Filter to the current autoupdate entry value by orgs
        const newData = buildOrgs.indexOf(value) >= 0 ? reserveData.filter((contact) =>
          contact.organizations.filter((org) =>
            org.name.toUpperCase().indexOf(value.toUpperCase()) >= 0).length > 0
        ) : [];
        this.setState({ dialogFilterText: value, hasMore: false, dialogData: newData });
      }
    } else {
      this.setState({ hasMore: true, dialogData: reserveData.slice(0, this.NUM_RECORDS) });
    }
  }

  handleUserAutoUpdateInput = (event, value) => {
    const { reserveData } = this.state;

    this.handleDeselectAll();

    if (value && value.length >= 3 && !!value.trim()) {
      const newData = reserveData.filter((contact) => 
        contact.userName.toUpperCase().indexOf(value.toUpperCase()) >= 0 ||
        contact.lastName.toUpperCase().indexOf(value.toUpperCase()) >= 0
      );
      this.setState({ hasMore: false, dialogData: newData });
    } else {
      this.setState({ hasMore: true, dialogData: reserveData.slice(0, this.NUM_RECORDS) });
    }
  }

  handleDialogSubmit = () => {
    const { contacts, dialogData } = this.state;
    const contactList = dialogData.reduce((r, c) => !!contacts[c.userName] ? [...r, c.userName] : r, []);

    if (contactList.length > 0) {
      this.props.onSubmit(contactList);
      this.closeDialog();
    } else {
      alert('No contacts selected.');
    }
  }

  handleCellSelection = (event) => {
    const dataId = event.target.getAttribute('data-id');
    this.setState(update(this.state, {
      contacts: { $merge: { [dataId]: !this.state.contacts[dataId] } },
    }));
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    
    this.setState(update(this.state, { contacts: { $merge: { [name]: value } } }));
  }

  handleSelectAll = () => this.setState({ contacts: _.mapValues(this.state.contacts, () => true) })

  handleDeselectAll = () => this.setState({ contacts: _.mapValues(this.state.contacts, () => false) })

  loadData = () => {
    const { username: currentUsername } = this.props;
    let buildOrgs = [];
    let limitedData = [];
    restClient(GET_LIST, `listUsersInUserOrganizations`, {
      filter: {},
      sort: {field: 'updated', order: 'Desc'},
      pagination: {page: 1, perPage: 9999},
    })
      .then((results) => {
        const roster = this.state.roster;
        const contacts = {};
        let data = [];

        results.data.forEach((result, key) => {
          const { userName, userStatus } = result;
          const match = _.find(roster, { userName });
          // Only list contacts not already on the roster
          if (userStatus !== 'Deactive' && userStatus !== 'Blocked' && userName &&
            userName !== currentUsername && userName.indexOf(' ') < 0 && !!userName.trim() && !match) {
            contacts[userName.toUpperCase()] = false;
            result.userName = userName.toUpperCase();
            result.firstName = result.firstName.toUpperCase();
            result.lastName = result.lastName.toUpperCase();
            result.organizations.forEach((org) => {
              if (buildOrgs.indexOf(org.name) < 0) {
                buildOrgs.push(org.name);
              }
            });
            data.push(result);
          }
        });
        // Limit dataset for performance
        limitedData = data.slice(0, this.NUM_RECORDS);
        // Sort list
        data = _.sortBy(data, 'userName');
        this.setState({
          hasMore: limitedData.length < data.length,
          contacts,
          dialogData: limitedData,
          reserveData: data,
          buildOrgs,
        });
      });
  }

  loadMoreRows = (event) => {
    const { dialogData, reserveData } = this.state;
    const newData = reserveData.slice(0, dialogData.length + this.NUM_RECORDS);

    this.handleDeselectAll();

    setTimeout(() => this.setState({ dialogData: newData }), 100);
  }

  selectMe = (event) => event.currentTarget.select()

  openDialog = () => this.setState({ dialogOpen: true })

  closeDialog = () => this.setState({ dialogOpen: false })

  render() {
    const { username } = this.props;
    const { dialogOpen, contacts, dialogData, reserveData, hasMore } = this.state;
    const checkboxes = (dialogData || []).map((item, index) => (
      <div key={index}>
        <Row style={contacts[item.userName] ? styles.rowChecked : styles.row}>
          <Col style={styles['sm-spacing']} data-id={item.userName} onClick={this.handleCellSelection} xs={1}>
            {contacts[item.userName] &&
              <Checkbox
                name={item.userName}
                checked={contacts[item.userName]}
                onCheck={this.handleInputChange}
              />
            }
          </Col>
          <Col style={styles['lg-spacing']} data-id={item.userName} onClick={this.handleCellSelection} xs={3}>
            {item.userName}
          </Col>
          <Col style={styles['lg-spacing']} data-id={item.userName} onClick={this.handleCellSelection} xs={5}>
            {item.firstName} {item.lastName}
          </Col>
          <Col data-id={item.userName} onClick={this.handleCellSelection} xs={3}>
            <OrgsField record={{ organizations: item.organizations, userName: item.userName }}/>
          </Col>
        </Row>
      </div>
    ));
    return (
      <Dialog
        title={
          <div>
            <div>Select users to add to {username ? `${username}'s` : 'the initial'} contact list</div>
            <AutoComplete
              style={{ width: '50%' }}
              hintText="Minimum 3 characters"
              dataSource={this.state.buildOrgs}
              onUpdateInput={this.handleOrgAutoUpdateInput}
              onClick={this.selectMe}
              floatingLabelText="Filter by My Organizations"
              filter={AutoComplete.caseInsensitiveFilter}
            />
            <TextFieldInput
              style={{ width: '50%' }}
              hintText="Minimum 3 characters"
              onChange={this.handleUserAutoUpdateInput}
              onClick={this.selectMe}
              floatingLabelText="Filter by Username or Last Name"
              filter={AutoComplete.caseInsensitiveFilter}
            />
            <div style={styles.displayCount}>
              Displaying {dialogData ? `${dialogData.length} of ${reserveData.length}` : ''} records
            </div>
          </div>
        }
        actions={[
          <FlatButton
            label="Select All"
            style={styles.actionText}
            icon={<AddIcon style={styles.actionIcon} />}
            disabled={checkboxes.length === 0}
            onClick={this.handleSelectAll}/>,
          <FlatButton
            label={'Deselect All'}
            style={styles.actionText}
            icon={<SubtractIcon style={styles.actionIcon} />}
            onClick={this.handleDeselectAll}/>,
          <FlatButton
            label="Cancel"
            primary={true}
            onClick={this.closeDialog}
          />,
          <FlatButton
            label="Add"
            primary={true}
            onClick={this.handleDialogSubmit}
          />
        ]}
        modal={false}
        open={dialogOpen}
        onRequestClose={this.closeDialog}
        autoScrollBodyContent
        titleStyle={styles.dialogTitleStyle}
      >
        {checkboxes.length ?
          <InfiniteScroll
            scrollThreshold={0.75}
            pullDownToRefresh
            pullDownToRefreshContent={
              <h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>
            }
            releaseToRefreshContent={
              <h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>
            }
            height="35vh"
            next={this.loadMoreRows}
            hasMore={hasMore}
            refreshFunction={this.loadData}
            loader={
              <p style={{ textAlign: 'center' }}>
                <CircularProgress size={20} thickness={3} style={styles['md-spacing']}/>loading...
              </p>
            }
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>No more contacts.</b>
              </p>
            }>
            <Grid fluid style={styles['md-spacing']}>
              {checkboxes}
            </Grid>
          </InfiniteScroll>
        :
          <p style={{ textAlign: 'center' }}>
            <b>No contacts found.</b>
          </p>
        }
      </Dialog>
    )
  }
}
