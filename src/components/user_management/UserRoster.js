import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Grid, Row, Col } from 'react-flexbox-grid';

import {
  GET_LIST,
  UPDATE,
} from 'admin-on-rest';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import CircularProgress from 'material-ui/CircularProgress';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import TextFieldInput from 'material-ui/TextField';
import ListIcon from 'material-ui/svg-icons/action/list';
import DeleteIcon from 'material-ui/svg-icons/action/delete-forever';
import AddPersonIcon from 'material-ui/svg-icons/social/person-add';
import AddIcon from 'material-ui/svg-icons/content/add-circle';
import SubtractIcon from 'material-ui/svg-icons/content/remove-circle';
import SortIcon from 'material-ui/svg-icons/content/sort';

import restClient from '../../IMYD-REST-Client';
import Utility from "../../js/utilities";

const OrgsField = ({record = {}}) =>
  <div>
    {
      record.organizations.map((org, i) => {
        return <div key={i} data-id={record.userName} style={{
          width: 'fit-content',
          margin: '3px',
          borderRadius: '4px 8px',
          backgroundColor: '#9ccd21',
          padding: '5px',
          fontSize: '12px',
          color: '#fff'
        }}>{org.name}</div>;
      })
    }
  </div>;

class UserRoster extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.NUM_RECORDS = 400;
    this.applyFilter = _.debounce(this.applyFilter, 500);
    this.state = {
      contacts: [],
      dialogOpen: false,
      roster: [],
      filteredRoster: [],
      buildOrgs: [],
      filtered: false,
      infinite: {
        hasMore: true
      },
      usernameFilter: '',
      emailFilter: '',
      sortBy: '',
      sortOrder: '',
    };
  }

  componentDidMount() {
    const userName = this.props.forPreset ? '' : localStorage.getItem('IMYD.rosterUsername');
    const presetName = this.props.forPreset ? localStorage.getItem('IMYD.rosterPresetName') : '';
    if (userName) {
      restClient(GET_LIST, `contacts/${userName}`, {
        filter: {},
        sort: {field: 'updated', order: 'Desc'},
        pagination: {page: 1, perPage: 9999},
      })
        .then(result => {
          this.setState({
            roster: result.data,
            filteredRoster: result.data,
            userName,
          });
        })
        .catch(e => {});
    } else if (presetName) {
      if (this.props.presets.length > 0) {
        this.updatePresetState(this.props.presets, presetName);
      } else {
        restClient(GET_LIST, `presets`, {
          filter: {},
          sort: {field: 'updated', order: 'Desc'},
          pagination: {page: 1, perPage: 9999},
        })
          .then((result) => {
            this.updatePresetState(result.data, presetName);
          })
          .catch(e => {});
      }
    }
  }

  handleCellSelection = (event) => {
    const dataId = event.target.getAttribute('data-id');
    let contacts = this.state.contacts;
    contacts[dataId] = contacts[dataId] ? false : true;
    this.setState({contacts});
  };

  isSelected = (index) => {
    return this.state.contacts[index];
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let contacts = this.state.contacts;
    contacts[name] = value;
    this.setState({contacts});
  };

  handleSelectAll = () => {
    let contacts = this.state.contacts;
    for (var key in contacts) {
      contacts[key] = true;
    }
    this.setState({contacts});
  };

  handleDeselectAll = () => {
    let contacts = this.state.contacts;
    for (var key in contacts) {
      contacts[key] = false;
    }
    this.setState({contacts});
  };

  handleDialogOpen = (mode) => {
    let buildOrgs = [],
      limitedData = [];

    restClient(GET_LIST, `listUsersInUserOrganizations`, {
      filter: {},
      sort: {field: 'updated', order: 'Desc'},
      pagination: {page: 1, perPage: 9999},
    })
      .then(results => {
        const roster = this.state.roster;
        let contacts = {},
          data = [];

        results.data.forEach((result, key) => {
          let match = _.find(roster, {userName: result.userName});
          // Only list contacts not already on the roster
          if (result.userStatus !== 'Deactive' && result.userStatus !== 'Blocked' && result.userName !== this.state.userName
            && result.userName.toString().indexOf(' ') < 0 && result.userName.toString().trim() !== '' && !match) {
            contacts[result.userName.toString().toUpperCase()] = mode === 'all';
            result.userName = result.userName.toString().toUpperCase();
            result.firstName = result.firstName.toString().toUpperCase();
            result.lastName = result.lastName.toString().toUpperCase();
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
        data = _.sortBy(data, ['userName']);
        this.setState({
          infinite: {
            hasMore: limitedData.length < data.length,
          },
          contacts,
          dialogData: limitedData,
          reserveData: data,
          dialogOpen: true,
          buildOrgs
        });
      });
  };

  handleDialogSubmit = () => {
    const { contacts, userName, preset, dialogData } = this.state;
    const contactList = dialogData.reduce((r, c) => !!contacts[c.userName] ? [...r, c.userName] : r, []);
    let timeout;

    if (contactList.length > 0) {
      

      this.setState({dialogOpen: false});
      let group = [];
      // console.log('contacts to add: ', contactList);
      contactList.forEach((contact, index) => {
        group.push(contact);
        let count = index + 1;
        if(count <= this.NUM_RECORDS && (count % 100 === 0 || count === contactList.length)) {
          // console.log(index, group);
          if (userName) {
            restClient('ADD_TO_ROSTER', 'addUserToRoster', {
              username: userName,
              contacts: group
            })
              .then((result) => {
                if(count >= this.NUM_RECORDS && contactList.length > this.NUM_RECORDS) {
                  alert(`Contact list updates are limited to ${this.NUM_RECORDS} contacts at a time.  Please repeat your update as needed until you have added the necessary contacts to this account.`);
                }
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  alert('Contact list updates may take a few minutes to synchronize between servers.  Don\'t panic of your total roster count is initially lower than expected.  Give it a few minutes then refresh the page for an updated count.');
                  window.location.reload();
                }, 1000);
              });
          } else if (preset) {
            const updatedPreset = {
              ...preset,
              sender: { userName: preset.sender.userName },
              initialContacts: preset.initialContacts.map(({ userName }) => ({ userName }))
                .concat(group),
            };
            restClient(UPDATE, 'presets', {
              id: preset.id,
              data: updatedPreset,
            })
              .then((result) => {
                setTimeout(() => window.location.reload(), 200);
              });
          }
          group.length = 0;
        }
      });

    } else {
      alert('No contacts selected.');
    }
  };

  handleDialogClose = () => {
    this.setState({dialogOpen: false});
  };

  handleRemoveContact = (userToRemove) => {
    const { userName, preset } = this.state;
    if (userName) {
      restClient('REMOVE_FROM_ROSTER', 'removeUserFromRoster', {
        username: userName,
        userToRemove
      })
        .then((result) => {
          setTimeout(() => window.location.reload(), 200);
        });
    } else if (preset) {
      const updatedPreset = {
        ...preset,
        sender: { userName: preset.sender.userName },
        initialContacts: preset.initialContacts.filter(c => c.userName !== userToRemove)
          .map(({ userName }) => ({ userName })),
      };
      restClient(UPDATE, 'presets', {
        id: preset.id,
        data: updatedPreset,
      })
        .then((result) => {
          setTimeout(() => window.location.reload(), 200);
        });
    }
  };

  handleOrgAutoUpdateInput = (value) => {
    this.handleDeselectAll();

    if (value.length >= 3 && !!value.toString().trim()) {
      const dialogData = this.state.reserveData, //this.state.dialogData.length > 0 ? this.state.dialogData : this.state.reserveData,
        dialogFilterText = this.state.dialogFilterText;

      if (value !== dialogFilterText) {
        // Filter to the current autoupdate entry value by orgs
        let newData = this.state.buildOrgs.indexOf(value) >= 0 ? dialogData.filter((contact) => {
          return contact.organizations.filter((org) => {
            return org.name.toUpperCase().indexOf(value.toString().toUpperCase()) >= 0;
          }).length > 0;
        }) : [];
        this.setState({
          dialogFilterText: value,
          infinite: {
            hasMore: false
          },
          dialogData: newData,
        });
      }
    }
    else if (value.toString().trim() === '') {
      this.setState({
        infinite: {
          hasMore: true
        },
        dialogData: this.state.reserveData.slice(0, this.NUM_RECORDS)
      });
    }
  };

  handleUserAutoUpdateInput = (event, value) => {
    const dialogData = this.state.reserveData;
    let usernameData = [],
      lastNameData = [],
      newData = [];

    this.handleDeselectAll();

    if (value.length >= 3 && value.toString().trim() !== '') {
      usernameData = dialogData.filter((contact) => {
        return contact.userName.toUpperCase().indexOf(value.toString().toUpperCase()) >= 0;
      });

      lastNameData = dialogData.filter((contact) => {
        return contact.lastName.toUpperCase().indexOf(value.toString().toUpperCase()) >= 0;
      });

      newData = usernameData.concat(lastNameData);
      newData = Utility.Array.dedup(newData)

      this.setState({
        infinite: {
          hasMore: false
        },
        dialogData: newData
      });
    } else {
      this.setState({
        infinite: {
          hasMore: true
        },
        dialogData: dialogData.slice(0, this.NUM_RECORDS)
      });
    }
  };

  handleFilterChange = key => (e, val) => this.setState({ [key]: val }, this.applyFilter);

  handleSortChange = (by) => {
    const { sortBy, sortOrder, filteredRoster } = this.state;
    if (sortBy !== by) {
      this.setState({
        sortBy: by,
        sortOrder: 'asc',
        filteredRoster: _.sortBy(filteredRoster, [this.sortFactor(by)]),
      });
    } else {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : '';
      if (newSortOrder) {
        this.setState({
          sortOrder: newSortOrder,
          filteredRoster: filteredRoster.reverse(),
        });
      } else {
        this.setState({
          sortBy: '',
          sortOrder: '',
        }, this.applyFilter);
      }
    }
  }

  applyFilter = () => {
    const { usernameFilter, emailFilter, sortBy, sortOrder, roster } = this.state
    let filteredData = roster.slice(0);
    if (usernameFilter.trim()) {
      const keyword= usernameFilter.trim().toLowerCase();
      filteredData = filteredData.filter(user => `${user.firstName} ${user.lastName} (${user.userName})`
        .toLowerCase().includes(keyword));
    }
    if (emailFilter.trim()) {
      const keyword= emailFilter.trim().toLowerCase();
      filteredData = filteredData.filter(user => user.email.toLowerCase().includes(keyword));
    }
    if (sortBy) {
      filteredData = _.sortBy(filteredData, [this.sortFactor(sortBy)]);
    }
    if (sortBy && sortOrder === 'desc') {
      filteredData = filteredData.reverse();
    }
    this.setState({ filteredRoster: filteredData });
  }

  sortFactor = by => c => c[by].toLowerCase()

  loadMoreRows = (event) => {
    const dialogData = this.state.dialogData,
      newData = this.state.reserveData.slice(0, dialogData.length + this.NUM_RECORDS);

    this.handleDeselectAll();

    setTimeout(() =>
        this.setState({
          dialogData: newData,
          loadingMore: false
        }),
      100
    );
  };

  selectMe = (event) => {
    event.currentTarget.select();
  };

  updatePresetState = (presets, presetName) => {
    const preset = presets.find(p => p.name === presetName);
    const contactsList = (preset || {}).initialContacts || [];
    this.setState({
      preset,
      presetName,
      roster: contactsList,
      filteredRoster: contactsList,
    });
  }

  render() {
    const styles = {
        title: {
          lineHeight: '36px',
          color: 'rgba(0, 0, 0, 0.87)',
          fontSize: 24,
          padding: 16,
        },
        heading: {
          minHeight: 150,
        },
        header: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          fontWeight: 700
        },
        headerWide: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          fontWeight: 700,
          width: 'auto'
        },
        actionHeader: {
          width: '70px'
        },
        noWrapHeader: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          width: '20%'
        },
        noWrap: {
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          width: '20%'
        },
        noWrapHeaderWide: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          width: '25%'
        },
        noWrapWide: {
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          width: '25%'
        },
        body: {
          overflowY: 'auto',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
          backgroundColor: 'rgb(245, 245, 245)'
        },
        listItem: {
          backgroundColor: 'rgb(245, 245, 245)'
        },
        actionBar: {
          position: 'absolute',
          top: '0px',
          right: '30px',
          padding: '8px'
        },
        actionIcon: {
          color: '#9ccd21',
          fill: '#9ccd21',
          fontWeight: 100
        },
        actionText: {
          color: '#9ccd21'
        },
        delete: {
          color: 'red',
          fill: 'red'
        },
        action: {
          width: '2%',
          padding: '0px 2px'
        },
        displayCount: {
          lineHeight: '5px',
          fontSize: '10px',
          width: '100%',
          textAlign: 'right'
        },
        grid: {
          padding: '3px 5px'
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
        checkCell: {
          paddingTop: '3px'
        },
        textCell: {
          paddingTop: '7px'
        },
        dialogTitleStyle: {
          borderBottom: '1px solid #ddd'
        },
        loading: {
          padding: '5px'
        },
        filterInput: {
          margin: '0 15px',
        },
        sortIconUp: {
          transform: 'rotate(180deg)',
        },
        fillWidth: {
          width: '100%',
        },
      },
      dialogActions = [
        <FlatButton
          label={'Select All'}
          style={styles.actionText}
          icon={<AddIcon style={styles.actionIcon}/>}
          onClick={this.handleSelectAll}/>,
        <FlatButton
          label={'Deselect All'}
          style={styles.actionText}
          icon={<SubtractIcon style={styles.actionIcon}/>}
          onClick={this.handleDeselectAll}/>,
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this.handleDialogClose}
        />,
        <FlatButton
          label="Add"
          primary={true}
          onClick={this.handleDialogSubmit}
        />
      ],
      dialogDisabledActions = [
        <FlatButton
          label={'Select All'}
          style={styles.actionText}
          icon={<AddIcon style={styles.actionIcon}/>}
          onClick={this.handleSelectAll}
          disabled={true}
        />,
        <FlatButton
          label={'Deselect All'}
          style={styles.actionText}
          icon={<SubtractIcon style={styles.actionIcon}/>}
          onClick={this.handleDeselectAll}
          disabled={true}
        />,
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this.handleDialogClose}
        />,
        <FlatButton
          label="Add"
          primary={true}
          onClick={this.handleDialogSubmit}
          disabled={true}
        />
      ];
    const checkboxes = [],
      dialogData = this.state.dialogData;
    if (dialogData) {
      dialogData.forEach((item, index) => {
        checkboxes.push(
          <div key={index}>
            <Row style={this.state.contacts[item.userName] ? styles.rowChecked : styles.row}>
              <Col style={styles.checkCell} data-id={item.userName} onClick={this.handleCellSelection} xs={1}>
                {this.state.contacts[item.userName] ? <Checkbox
                  name={item.userName}
                  checked={this.state.contacts[item.userName]}
                  onCheck={this.handleInputChange}
                /> : ''}
              </Col>
              <Col style={styles.textCell} data-id={item.userName} onClick={this.handleCellSelection} xs={3}>
                {item.userName}
              </Col>
              <Col style={styles.textCell} data-id={item.userName} onClick={this.handleCellSelection} xs={5}>
                {item.firstName} {item.lastName}
              </Col>
              <Col data-id={item.userName} onClick={this.handleCellSelection} xs={3}>
                <OrgsField record={{organizations: item.organizations, userName: item.userName}}/>
              </Col>
            </Row>
          </div>
        );
      });
    }

    const {
      filteredRoster: roster, usernameFilter, emailFilter, sortBy, sortOrder, userName, presetName,
    } = this.state;
    const titleValue = (userName || presetName || '').toUpperCase();
    return (
      <div id="rosterBody" style={styles.body}>
        <div style={styles.heading}>
          <div style={styles.title}>
            {userName ? `${titleValue}'s Contact List (${roster.length})` :
              (presetName ? `Initial Contact List for Preset ${titleValue}`:
                <CircularProgress size={40} thickness={2} style={styles.loading}/>)
            }
          </div>
          <div style={styles.actionBar}>
            <FlatButton label={'List'} style={styles.actionText}
                        icon={<ListIcon style={styles.actionIcon}/>}
                        href={this.props.forPreset ? '#/presets' : '#/healthcareprofessionals'}/>
            <FlatButton label={'Add Contact(s) By Organization'} style={styles.actionText}
                        icon={<AddPersonIcon style={styles.actionIcon}/>} onClick={this.handleDialogOpen}/>
          </div>
          <Row center="xs" style={styles.fillWidth}>
            <Col xs={12} md={6}>
              <TextFieldInput
                value={usernameFilter}
                floatingLabelText="Filter by Name"
                onChange={this.handleFilterChange('usernameFilter')}
                style={styles.filterInput}
              />
            </Col>
            <Col xs={12} md={6}>
              <TextFieldInput
                value={emailFilter}
                floatingLabelText="Filter by Email"
                onChange={this.handleFilterChange('emailFilter')}
                style={styles.filterInput}
              />
            </Col>
          </Row>
        </div>
        <Table
          selectable={false}
          height={`${window.innerHeight - 291}px`}
          fixedHeader={true}
        >
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={styles.noWrapHeader}>
                <FlatButton
                  label="NAME"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('userName')}
                  icon={sortBy === 'userName' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.noWrapHeaderWide}>
                <FlatButton
                  label="email"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('email')}
                  icon={sortBy === 'email' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.header}>TYPE</TableHeaderColumn>
              <TableHeaderColumn style={styles.header}>ORGS</TableHeaderColumn>
              <TableHeaderColumn style={styles.header}>ACTION</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody stripedRows={true} showRowHover={true} displayRowCheckbox={false}>
            {
              roster.length ?
                roster.map((user, i) =>
                  <TableRow key={i}>
                    <TableRowColumn style={styles.noWrapHeader}>{user.firstName} {user.lastName} ({user.userName})</TableRowColumn>
                    <TableRowColumn style={styles.noWrapWide}>{user.email}</TableRowColumn>
                    <TableRowColumn>
                      {user.userType && (
                        user.userType.toLowerCase().indexOf("hospital_admin") >= 0 ? 'SUB ADMIN' :
                        user.userType.toLowerCase().indexOf("hospital_super_admin") >= 0 ? 'SUPER ADMIN' :
                        user.userType.toLowerCase().indexOf("patient") >= 0 ? 'PATIENT' :
                          'STAFF'
                      )}
                    </TableRowColumn>
                    <TableRowColumn><OrgsField record={{organizations: user.organizations, userName: user.userName}}/></TableRowColumn>
                    <TableRowColumn><FlatButton style={styles.delete}
                                                label="Remove"
                                                icon={<DeleteIcon style={styles.delete}/>}
                                                onClick={() => this.handleRemoveContact(user.userName)}/></TableRowColumn>
                  </TableRow>
                ) :
                <TableRow>
                  <TableRowColumn>No contacts found.</TableRowColumn>
                </TableRow>
            }
          </TableBody>
        </Table>
        <Dialog
          title={
            <div>
              <div>
                Select users to add to{' '}
                {userName ? `${titleValue}'s contact list` : `initial contact list for preset ${titleValue}`}
              </div>
              <AutoComplete
                style={{width: '50%'}}
                hintText="Minimum 3 characters"
                dataSource={this.state.buildOrgs}
                onUpdateInput={this.handleOrgAutoUpdateInput}
                onClick={this.selectMe}
                floatingLabelText="Filter by My Organizations"
                filter={AutoComplete.caseInsensitiveFilter}
              />
              <TextFieldInput
                style={{width: '50%'}}
                hintText="Minimum 3 characters"
                onChange={this.handleUserAutoUpdateInput}
                onClick={this.selectMe}
                floatingLabelText="Filter by Username or Last Name"
                filter={AutoComplete.caseInsensitiveFilter}
              />
              <div style={styles.displayCount}>
                Displaying {this.state.dialogData ? `${this.state.dialogData.length} of ${this.state.reserveData.length}` : ''} records
              </div>
            </div>
          }
          actions={checkboxes.length ? dialogActions : dialogDisabledActions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleDialogClose}
          autoScrollBodyContent={true}
          titleStyle={styles.dialogTitleStyle}
        >
          {checkboxes.length ?
            <InfiniteScroll
              scrollThreshold={0.75}
              pullDownToRefresh={true}
              pullDownToRefreshContent={
                <h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>
              }
              releaseToRefreshContent={
                <h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>
              }
              height="35vh"
              next={this.loadMoreRows}
              hasMore={this.state.infinite.hasMore}
              refreshFunction={this.handleDialogOpen}
              loader={<p style={{textAlign: 'center'}}><CircularProgress size={20} thickness={3} style={styles.loading}/>loading...</p>}
              endMessage={
                <p style={{textAlign: 'center'}}>
                  <b>No more contacts.</b>
                </p>
              }>
              <Grid fluid style={styles.grid}>
              {checkboxes}
              </Grid>
            </InfiniteScroll> :
            <p style={{textAlign: 'center'}}>
              <b>No contacts found.</b>
            </p>}
        </Dialog>
      </div>
    );
  }
}

export default connect(state => ({
  presets: _.values((state.admin.resources.presets || {}).data) || [],
}))(UserRoster);
