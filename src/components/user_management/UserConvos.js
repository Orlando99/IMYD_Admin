import React, {Component} from 'react';
import restClient from '../../IMYD-REST-Client';
import moment from 'moment';
import { Row, Col } from 'react-flexbox-grid';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import {
  GET_LIST,
  FunctionField
} from 'admin-on-rest';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import TextFieldInput from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import ListIcon from 'material-ui/svg-icons/action/list';
import SortIcon from 'material-ui/svg-icons/content/sort';

import ShowConvoButton from '../user_management/ShowConvoButton';
import Utility from "../../js/utilities";

class UserConvos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      records: [],
      filteredRecords: [],
      user: JSON.parse(localStorage.getItem('IMYD.convoUsername')) || {},
      nameFilter: '',
      typeFilter: '',
      membersFilter: '',
      sortBy: '',
      page: 0,
    };
    this.loadData = _.debounce(this.loadData, 500);
  }

  componentWillMount() {
    if (this.state.user) {
      this.loadData();
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
    // document.scrollingElement.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
    // document.scrollingElement.removeEventListener('scroll', this.handleScroll);
  }

  loadData = () => {
    this.setState({ loading: true });
    restClient(GET_LIST, `communication/${this.state.user.username}/threads/filter`, {
      filter: {},
      sort: {field: 'id', order: 'Desc'},
      pagination: {page: this.state.page + 1, perPage: 25},
    })
      .then(result => {
        if (result.data && result.data.length > 0) {
          const newRecords = this.state.records.concat(_.uniqBy(result.data, r => r.id));
          this.setState({
            records: newRecords,
            loading: false,
            page: this.state.page + 1,
            hasMore: result.data.length >= 25,
          }, this.applyFilter);
        } else {
          this.setState({ loading: false, hasMore: false });
        }
      });
  }

  handleFilterChange = key => (e, val) => this.setState({ [key]: val }, this.applyFilter);

  handleSortChange = (by) => {
    const { sortBy, sortOrder, filteredRecords } = this.state;
    if (sortBy !== by) {
      this.setState({
        sortBy: by,
        sortOrder: 'asc',
        filteredRecords: _.sortBy(filteredRecords, this.sortFactor(by)),
      });
    } else {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : '';
      if (newSortOrder) {
        this.setState({
          sortOrder: newSortOrder,
          filteredRecords: filteredRecords.reverse(),
        });
      } else {
        this.setState({
          sortBy: '',
          sortOrder: '',
        }, this.applyFilter);
      }
    }
  }

  handleScroll = () => {
    const scrollingElement = document.scrollingElement;
    const { loading, hasMore } = this.state;
    if (scrollingElement.scrollTop >= scrollingElement.scrollHeight - scrollingElement.clientHeight && !loading && hasMore) {
			this.loadData();
		}
  }

  applyFilter = () => {
    const { nameFilter, typeFilter, membersFilter, sortBy, sortOrder, records } = this.state
    let filteredData = records.slice(0);
    if (nameFilter.trim()) {
      const keyword= nameFilter.trim().toLowerCase();
      filteredData = filteredData.filter(convo => convo.naturalName.toLowerCase().includes(keyword));
    }
    if (typeFilter.trim()) {
      const keyword= typeFilter.trim().toLowerCase();
      filteredData = filteredData.filter(convo => convo.type.toLowerCase().includes(keyword));
    }
    if (membersFilter.trim()) {
      const keyword= membersFilter.trim().toLowerCase();
      filteredData = filteredData.filter(convo => convo.users.map(u => u.username).join(', ')
        .toLowerCase().includes(keyword));
    }
    if (sortBy) {
      filteredData = _.sortBy(filteredData, this.sortFactor(sortBy));
    }
    if (sortBy && sortOrder === 'desc') {
      filteredData = filteredData.reverse();
    }
    this.setState({ filteredRecords: filteredData });
  }

  sortFactor = by => {
    switch (by) {
      case 'members':
        return c => c.users.map(u => u.username).join(', ').toLowerCase();
      case 'updated':
        return c => c.lastMessage.timestamp;
      default:
        return c => c[by].toLowerCase();
    }
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
          width: 'auto',
          boxSizing: 'border-box',
        },
        noWrapHeader: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          width: '20%',
          boxSizing: 'border-box',
        },
        noWrap: {
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          width: '20%'
        },
        noWrapHeaderWide: {
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.87)',
          width: '30%',
          boxSizing: 'border-box',
        },
        noWrapWide: {
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          width: '30%'
        },
        body: {
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
          backgroundColor: 'rgb(245, 245, 245)',
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
        loading: {
          top: '20px',
          left: '20px',
          padding: '5px',
          color: '#fff'
        },
        loadingContainer: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '15px 0',
        },
        filterInput: {
          margin: '0 15px',
        },
        sortIconUp: {
          transform: 'rotate(180deg)',
        },
        rightSpacing: {
          marginRight: '10px',
        },
        row: {
          width: '100%',
        },
      };
    const {
      filteredRecords: records, loading, user: { username, name },
      nameFilter, typeFilter, membersFilter, sortBy, sortOrder, page,
    } = this.state;
    if (loading && page === 0) {
      return <CircularProgress size={40} thickness={4} style={styles.loading}/>;
    }

    return (
      <div style={styles.body}>
        <div style={styles.heading}>
          <div style={styles.title}>User Conversations for {username}</div>
          <div style={styles.actionBar}>
            <FlatButton
              label={'List'}
              style={styles.actionText}
              icon={<ListIcon style={styles.actionIcon}/>}
              href="#/healthcareprofessionals"
            />
          </div>
          <Row center="xs" style={styles.row}>
            <Col xs={12} md={4}>
              <TextFieldInput
                value={nameFilter}
                floatingLabelText="Filter by Name"
                onChange={this.handleFilterChange('nameFilter')}
                style={styles.filterInput}
              />
            </Col>
            <Col xs={12} md={4}>
              <TextFieldInput
                value={typeFilter}
                floatingLabelText="Filter by Type"
                onChange={this.handleFilterChange('typeFilter')}
                style={styles.filterInput}
              />
            </Col>
            <Col xs={12} md={4}>
              <TextFieldInput
                value={membersFilter}
                floatingLabelText="Filter by Members"
                onChange={this.handleFilterChange('membersFilter')}
                style={styles.filterInput}
              />
            </Col>
          </Row>
        </div>
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={styles.noWrapHeader}>
                <FlatButton
                  label="NAME"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('naturalName')}
                  icon={sortBy === 'naturalName' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.noWrapHeader}>
                <FlatButton
                  label="TYPE"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('type')}
                  icon={sortBy === 'type' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.noWrapHeaderWide}>
                <FlatButton
                  label="MEMBERS"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('members')}
                  icon={sortBy === 'members' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.noWrapHeader}>
                <FlatButton
                  label="LATEST MESSAGE"
                  labelPosition="before"
                  onClick={() => this.handleSortChange('updated')}
                  icon={sortBy === 'updated' && (sortOrder === 'asc' ?
                    <SortIcon style={styles.sortIconUp} /> : <SortIcon />)}
                />
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.header}>VIEW</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody stripedRows={true} showRowHover={true} displayRowCheckbox={false}>
            {(records && records.length > 0) ? records.map((convo, i) =>
                <TableRow key={i}>
                  <TableRowColumn style={styles.noWrap}>{convo.naturalName}</TableRowColumn>
                  <TableRowColumn style={styles.noWrap}>
                    {convo.type === 'ONE_TO_ONE' ? 'direct' : 'group'}
                  </TableRowColumn>
                  <TableRowColumn style={styles.noWrapWide}>
                    <FunctionField source="users" render={record =>
                      convo.users ? convo.users.map(u => u.username).join(', ') : ''
                    }/>
                  </TableRowColumn>
                  <TableRowColumn style={styles.noWrap}>
                    <FunctionField
                      source="updated"
                      render={() => (convo.lastMessage ? moment(convo.lastMessage.timestamp,
                        'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) : ''
                      )}
                    />
                  </TableRowColumn>
                  <TableRowColumn>
                    <ShowConvoButton
                      id={convo.id}
                      data={convo}
                      username={username}
                      name={name}
                      type="userconversations"
                      style={styles.show}
                      label=""
                    />
                  </TableRowColumn>
                </TableRow>
            ):
              <TableRow>
                <TableRowColumn>No results found.</TableRowColumn>
              </TableRow>
            }
          </TableBody>
        </Table>
        {loading &&
          <div style={styles.loadingContainer}>
            <CircularProgress size={30} thickness={4} style={styles.rightSpacing} />
            <span>Loading More...</span>
          </div>
        }
      </div>
    );
  }
};

export default withRouter(UserConvos);
