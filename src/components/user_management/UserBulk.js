import React, {Component} from 'react';
import restClient from '../../IMYD-REST-Client';
import _ from 'lodash';

import xlsx from 'xlsx';
import HotTable from 'react-handsontable';
import Dropzone from 'react-dropzone';
import Dialog from 'material-ui/Dialog';
import {Grid, Row, Col} from 'react-flexbox-grid';

import {
  GET_LIST,
  CREATE
} from 'admin-on-rest';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import ListIcon from 'material-ui/svg-icons/action/list';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import SubmitIcon from 'material-ui/svg-icons/av/playlist-add';
import HelpIcon from 'material-ui/svg-icons/action/help-outline';
import SelectField from 'material-ui/SelectField';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';

import {withRouter} from 'react-router-dom'

class UserBulk extends Component {
  constructor(props) {
    super(props);
    this.userNumber = {};
    this.validData = null;
    this.invalidData = null;
    this.hotValid = false;
    this.userType = props.match.params.type;
    this.colHeaders = ['firstName*', 'lastName*', 'userName*', 'email*', 'phone*', ...(this.userType === 'staff' ? ['zip*'] : [])];
    this.state = {
      files: [],
      drag: false,
      templateOver: false,
      dropMessage: 'Drop user list here or Click here to browse. (format: .xls or .xlsx)',
      validationMessage: '',
      autoUserMessage: '',
      colHeaders: this.colHeaders,
      reqHeaders: this.colHeaders,
      objectData: [_.fill(_.range(this.colHeaders.length), '')],
      dialogOpen: false,
      rosterAddCount: 0,
      facilities: [],
      facility: '',
      presets: [],
      preset: '',
    };
  }

  componentDidMount() {
    restClient('GET', `facilities`, {})
      .then(facilities => {
        this.setState({
          facilities: facilities.data,
          facility: _.find(facilities.data, {primary: true}).name
        })
      });
    restClient('GET', `presets`, {})
      .then(presets => this.setState({ presets: presets.data }));
  }

  resetHot = () => {
    this.setState({
      message: '',
      file: null,
      drag: false,
      dropMessage: 'Drop user list here or Click here to browse. (format: .xls or .xlsx)',
      objectData: [_.fill(_.range(this.colHeaders.length), '')]
    });
  };

  onDrop = (files) => {
    let self = this, message;

    this.setState({
      message: '',
      file: null,
      drag: false,
      objectData: null,
      dropMessage: 'Drop user list here or Click here to browse. (format: .xls or .xlsx)'
    });

    let reader = new FileReader();
    // let name = files[0].name;
    reader.onload = function (e) {
      let data = e.target.result,
        hot;

      // Realtime validate posted data
      setTimeout(() => {
          hot = self.refs.hot ? self.refs.hot.hotInstance : null;
          if (hot) {
            hot.validateCells();
          }
        },
        1000
      );

      /* if binary string, read with type 'binary' */
      let workbook = xlsx.read(data, {type: 'binary'});

      let sheet_name_list = workbook.SheetNames;
      if (data && sheet_name_list.length === 1) {
        message = 'Success';

        let objectData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {header:0});

        // Reshape the objects into array elements
        objectData = objectData.map((item,index) => {
          if(index < 50) {
            let row = _.values(item), position = 0;
            // Fix missing username column for empty username column in spreadsheet
            _.each(item, (prop, colName) => {
              position++;
              if (position === 3 && colName !== 'userName') {
                row.splice(2, 0, '');
              }
            });
            return row;
          }
          return [];
        });

        self.setState({
          message,
          file: files[0],
          drag: false,
          objectData,
          dropMessage: 'Drop user list here or Click here to browse. (format: .xls or .xlsx)',
        });
      } else if (data && sheet_name_list.length > 1) {
        message = 'Your workbook has multiple sheets, this may interfere will proper import.';
      } else {
        message = 'Error!';
      }
    };
    reader.readAsBinaryString(files[0]);
  };

  handleDragover = (event) => {
    this.setState({
      drag: true
    })
  };

  handleDragleave = (event) => {
    this.setState({
      drag: false
    })
  };

  handleTemplateEnter = (event) => {
    this.setState({
      templateOver: true
    })
  };

  handleTemplateLeave = (event) => {
    this.setState({
      templateOver: false
    })
  };

  handleValidateUsers = () => {
    if (!this.valiationInProgress) {
      let hot = this.refs.hot ? this.refs.hot.hotInstance : null,
        hotData = this.refs.hot ? this.refs.hot.hotInstance.getSourceData() : null;

      this.hotValid = true;
      this.validData = [];
      this.invalidData = [];

      this.setState({
        validationMessage: '',
        autoUserMessage: ''
      });

      if (hot && hotData) {
        this.valiationInProgress = true;
        this.validateUserRecord(0);
      }
    }
  };

  validateUserRecord = (rowNum) => {
    let hot = this.refs.hot ? this.refs.hot.hotInstance : null,
      hotData = this.refs.hot ? this.refs.hot.hotInstance.getSourceData() : null;
    if (hot && hotData) {
      if (rowNum < hotData.length && _.some(hotData[rowNum], Boolean)) {
        const row = hotData[rowNum];
        let newRow = [], newRowObject, reasonString = '', userNameColIndex = -1;
        _.each(row, (item, colIndex) => {
          let colHeader = _.trimEnd(hot.getColHeader(colIndex), '*'),
            firstName = row[0],
            lastName = row[1],
            itemValue = item ? item.trim() : null,
            invalid = false;

          if (colHeader === 'userName') {
            // Do we need to create the username?
            this.userNumber[rowNum] = 0;
            if (!itemValue || !itemValue.trim()) {
              // auto-generate username
              itemValue = `${(firstName || '').substring(0, 4)}${(lastName || '').substring(0, 4)}`.trim().toLowerCase();
            }
            let existing = !!hotData.slice(0, rowNum).find(r =>
              r && r[colIndex] && r[colIndex].trim().toLowerCase() === itemValue);
            if (existing) {
              do {
                let previousNumber = this.userNumber[rowNum];
                this.userNumber[rowNum] += 1;
                itemValue = `${itemValue.replace(new RegExp(`${previousNumber}$`), '')}${this.userNumber[rowNum]}`;
                existing = !!hotData.slice(0, rowNum).find(r =>
                  r && r[colIndex] && r[colIndex].trim().toLowerCase() === itemValue);
              } while (existing);
            }
            hotData[rowNum][colIndex] = itemValue;
          }
          const validation = this.validateItem(itemValue, colHeader, rowNum);

          if (validation.status) {
            newRow.push({[colHeader]: validation.item});
            if (!_.find(newRow, {index: rowNum + 1})) {
              newRow.push({index: rowNum + 1});
            }
            if (colHeader === 'userName') {
              userNameColIndex = colIndex;
            }
          } else {
            invalid = true;
          }

          if (!!invalid) {
            reasonString += reasonString.length ? ', ' + validation.reason : validation.reason;
          }
        });
        if (reasonString) {
          newRow.push({reason: reasonString});
        }

        newRowObject = Object.assign({}, ...newRow);

        let keep = !_.has(newRowObject, 'reason');
        if (keep) {
          this.validData.push(newRowObject);
          this.validateUsername(rowNum, userNameColIndex, newRowObject.userName);
        } else {
          this.invalidData.push(newRowObject);
          this.hotValid = false;
          this.validateUserRecord(rowNum + 1)
        }
      } else {
        const resultState = { dialogOpen: true };
        if (!this.invalidData || this.invalidData.length <= 0) {
          this.hotValid = true;
          Object.assign(resultState, { validationMessage: '' });
        }
        hot.render();
        hot.validateCells();
        this.setState(resultState);
        this.valiationInProgress = false;
      }
    }
  }

  validateUsername = (rowNum, colNum, userName) => {
    let hot = this.refs.hot ? this.refs.hot.hotInstance : null,
      hotData = this.refs.hot ? this.refs.hot.hotInstance.getSourceData() : null;

    if (hot && hotData) {
      restClient('GET_USER', `users/${userName}/usernameExists`)
        .then(result => {
          // Does not already exist, assign this as the username
          hotData[rowNum][colNum] = result || userName.replace(/\s+/g, '').toLowerCase();
          
          // Found, try again with an incremented username
          if (result && _.find(hotData, (row, i) => i !== rowNum && row[colNum] &&
            row[colNum].trim().toLowerCase() === result.toLowerCase())) {
            if(!this.userNumber[rowNum] || !result.endsWith(`${this.userNumber[rowNum]}`)) {
              this.userNumber[rowNum] = 0;
            }
            let newUsername = `${result}`;
            let existing = false;
            do {
              let previousNumber = this.userNumber[rowNum];
              this.userNumber[rowNum] += 1;
              newUsername = `${newUsername.replace(new RegExp(`${previousNumber}$`), '')}${this.userNumber[rowNum]}`;
              existing = _.find(hotData, (row, i) => i !== rowNum && row[colNum] &&
                row[colNum].trim().toLowerCase() === newUsername.toLowerCase());
            } while (existing);
            return this.validateUsername(rowNum, colNum, newUsername);
          }

          if (!result && this.userNumber[rowNum] > 0) {
            let validationMessage = this.state.validationMessage;
            this.setState({
              validationMessage: validationMessage + (validationMessage.length > 0 ? ', ' + userName : userName),
              autoUserMessage: 'Note: One or more user names have been auto-generated.'
            });
          }
          // Re-render the hot table with the updated username
          hot.render();
          let rowDataIndex = _.findIndex(this.validData, r => r.index === rowNum + 1);
          if (rowDataIndex > -1) {
            this.validData[rowDataIndex].userName = hotData[rowNum][colNum];
          } else {
            rowDataIndex = _.findIndex(this.invalidData, r => r.index === rowNum + 1);
            if (rowDataIndex > -1) {
              this.invalidData[rowDataIndex].userName = hotData[rowNum][colNum];
            }
          }
          this.validateUserRecord(rowNum + 1);
        });
    }
  };

  validateItem = (item, type, rowIndex) => {
    let re, status, reason, hot = this.refs.hot ? this.refs.hot.hotInstance : null,
      userNames = hot.getDataAtCol(2);

    switch (type) {
      case 'userName':
        let itemRow = userNames.indexOf(item);
        status = item && item.trim() && !hot.isEmptyRow(rowIndex) && item.length >= 2 && itemRow === rowIndex;
        reason = !item.trim() ? '(blank username)' : item.length < 2 ? '(less than 2 characters)' : itemRow !== rowIndex ? '(duplicate username)' : '';
        reason = !status ? 'invalid ' + type + ' ' + reason : '';
        return {
          status,
          reason,
          item: item.replace(/\s+/g, '')
        };
      case 'email':
        re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
        status = re.test(item);
        reason = !status ? 'invalid ' + type : '';
        return {
          status,
          reason,
          item
        };
      case 'phone':
        re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
        status = re.test(item);
        reason = !status ? 'invalid ' + type : '';
        return {
          status,
          reason,
          item
        };
      case 'zip':
        re = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
        status = re.test(item);
        reason = !status ? 'invalid ' + type : '';
        return {
          status,
          reason,
          item
        };
      case 'userType':
        status = item && (item.toUpperCase() === 'STAFF' || item.toUpperCase() === 'PATIENT');
        reason = !status ? 'invalid ' + type : '';
        return {
          status,
          reason,
          item
        };
      default:
        status = item && item.trim();
        reason = !status ? 'invalid ' + type : '';
        return {
          status,
          reason,
          item
        };
    }
  };

  handleSubmitUsers = () => {
    const validData = this.validData;
    this.setState({
      userProcessing: true
    });

    let count = validData.length;
    validData.forEach((user, vdIndex) => {
      // Update the primary network
      user.userType = this.userType.toUpperCase();
      user.primaryNetwork = this.state.facility;
      if(user.userType === 'STAFF') {
        restClient(CREATE, `healthcareprofessionals`, {
          data: user
        })
          .then(addResult => {
            // updateRoster only after everyone has been added
            if(vdIndex === count - 1) {
              // Pulled out the roster update due to performance issues
              this.synchronizeRoster();
            }
          });
      } else {
        if (this.state.preset) {
          user.nppId = this.state.preset;
        }
        restClient(CREATE, `patients`, {
          data: user
        })
          .then(addResult => {
            // Add roster here if needed
            this.setState({
              dialogOpen: false,
              userProcessing: false
            });
            this.resetHot();
            this.props.history.push({pathname: '/'});
          });
      }
    });
    // console.log('Valid Data:', validData);
  };

  synchronizeRoster = (userIndex = 0) => {
    const _this = this, validData = this.validData, count = validData.length;
    restClient(GET_LIST, `listUsersInUserOrganizations`, {
      filter: {},
      sort: {field: 'updated', order: 'Desc'},
      pagination: {page: 1, perPage: 9999},
    })
      .then(results => {
        let contactList = _.map(results.data, 'userName');
        contactList.splice(contactList.indexOf(validData[userIndex].userName));

        if(contactList.length > 200) {
          alert('Your users have been added successfully, but there were too many contacts to add to each of them at one time so you will need to add contacts manually.');
          _this.setState({
            dialogOpen: false,
            userProcessing: false
          });
          _this.resetHot();
          _this.props.history.push({pathname: '/'});
        } else {
          restClient('ADD_TO_ROSTER', 'addUserToRoster', {
            username: validData[userIndex].userName,
            contacts: contactList
          })
            .then((result) => {
              if (userIndex < count - 1) {
                _this.setState({
                  rosterAddCount: userIndex
                });
                setTimeout(() => _this.synchronizeRoster(userIndex + 1), 2000);
              } else {
                _this.setState({
                  dialogOpen: false,
                  userProcessing: false
                });
                _this.resetHot();
                _this.props.history.push({pathname: '/'});
              }
            });
        }
      });
  };

  handleDialogClose = () => {
    let self = this;
    this.setState({
      dialogOpen: false
    });

    // Realtime validate posted data
    setTimeout(() => {
        let hot = self.refs.hot ? self.refs.hot.hotInstance : null;
        if (hot) {
          hot.validateCells();
        }
      },
      1000
    );
  };

  handleOrgChange = (event, index, value) => this.setState({ facility: value })
  
  handlePresetChange = (event, index, value) => this.setState({ preset: value })

  goToInstructions = () => document.getElementById('instructions').scrollIntoView()

  render() {
    const styles = {
        title: {
          lineHeight: '36px',
          color: 'rgba(0, 0, 0, 0.87)',
          fontSize: 24,
          padding: 16,
        },
        subtitle: {
          lineHeight: '30px',
          color: 'rgba(0, 0, 0, 0.47)',
          fontSize: 20,
          padding: '0 16px 0 16px',
        },
        heading: {
          height: 191,
        },
        body: {
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
          backgroundColor: 'rgb(245, 245, 245)'
        },
        helpIconButton: {
          width: 30,
          height: 30,
          padding: 5,
          marginLeft: 10,
          verticalAlign: 'text-bottom',
        },
        actionBar: {
          position: 'absolute',
          top: '0px',
          right: '0px',
          padding: '8px'
        },
        actionIcon: {
          color: '#9ccd21',
          fill: '#9ccd21',
          fontWeight: 100
        },
        disabledActionIcon: {
          color: '#aaa',
          fill: '#aaa',
          fontWeight: 100
        },
        actionText: {
          color: '#9ccd21'
        },
        dropContainer: {
          position: 'relative',
          top: '-30px',
          borderBottom: '1px solid #aaa'
        },
        dropzone: {
          width: '94%',
          height: '95%',
          borderRadius: '5px',
          border: '2px dotted #aaa',
          margin: '2%',
          padding: '2px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '1.5em',
          color: '#aaa',
          cursor: 'pointer'
        },
        dragDropzone: {
          width: '94%',
          height: '95%',
          borderRadius: '5px',
          border: '2px dotted #9ccd21',
          margin: '2%',
          padding: '2px',
          marginBottom: '2  0px',
          textAlign: 'center',
          fontSize: '1.5em',
          backgroundColor: '#eee',
          color: '#ddd'
        },
        template: {
          position: 'relative',
          float: 'right',
          margin: '0 10px 5px 10%',
          top: '-60px',
          fontSize: '.9em',
          color: '#888'
        },
        templateAnchor: {
          color: '#9ccd21'
        },
        templateOver: {
          color: '#aaa'
        },
        hotTable: {
          maxWidth: 'calc(100vw - 290px)',
          margin: '0px 20px'
        },
        fileStatus: {
          padding: '0 22px 10px',
          textDecoration: 'underline'
        },
        fileStatusError: {
          color: '#f00',
          padding: '0 22px 10px',
          textDecoration: 'underline',
          fontWeight: 700
        },
        disabledSubmitButton: {
          position: 'absolute',
          right: 0,
          top: '320px',
          color: '#aaa',
          fill: '#aaa',
          margin: '30px 40px 20px 0',
        },
        validateButton: {
          position: 'relative',
          float: 'right',
          margin: '30px 40px 10px 0',
          color: '#9ccd21',
          fill: '#9ccd21',
        },
        instructions: {
          padding: '10px 20px'
        },
        instructionSub: {
          margin: '10px 0',
        },
        instructionReq: {
          margin: '10px 0 0 0'
        },
        grid: {
          borderBottom: '1px solid #888',
          padding: '4px'
        },
        validTitle: {
          fontSize: '1em',
          fontWeight: 700,
          padding: '3px 0 3px 20px',
          backgroundColor: '#9ccd21',
          color: '#fff',
          textAlign: 'center'
        },
        preExisting: {
          fontSize: '1em',
          padding: '3px 0 3px 20px',
          color: '#333'
        },
        invalidTitle: {
          fontSize: '1em',
          fontWeight: 700,
          padding: '3px 0 3px 20px',
          marginTop: '30px',
          backgroundColor: '#f00',
          color: '#fff',
          textAlign: 'center'
        },
        invalidInstructions: {
          fontSize: '1em',
          fontWeight: 300,
          padding: '3px 0 3px 20px',
          color: '#f00'
        },
        invalidCell: {
          color: '#f00'
        },
        rosterAddCount: {
          float: 'left',
          padding: '10px 20px',
          color: '#9ccd21'
        },
        buttonWrapper: {
          height: '85px'
        },
        orgSelect: {
          padding: '3px 0 3px 20px',
          marginRight: 20,
        },
        floatingLabelStyle: {
          color: '#9ccd21'
        },
        selectedMenuItemStyle: {
          color: '#9ccd21'
        }
      },
      dialogActions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this.handleDialogClose}
        />,
        <FlatButton
          label="Add Users"
          primary={true}
          keyboardFocused={true}
          onClick={this.handleSubmitUsers}
          disabled={!this.hotValid}
        />
      ]

    if(this.state.userProcessing) {
      dialogActions.unshift(<CircularProgress style={{top: '4px', right: '4px'}} size={20} thickness={3}/>);
    }

    dialogActions.unshift(<div style={styles.rosterAddCount}>User(s) completed: {this.state.rosterAddCount} (Est. {this.state.objectData ? Math.round(this.state.objectData.length * 10 / 60) : 0} minutes to complete.)</div>);

    let drag = this.state.drag,
      rows = [], invalidRows = [];

    if (this.validData) {
      rows.push(
        <Row style={styles.grid} key={0}>
          <Col xs={1}></Col>
          <Col xs={5}>Username</Col>
          <Col xs={5}>Name</Col>
        </Row>
      );
      this.validData.forEach((row, index) => {
        rows.push(
          <Row style={styles.grid} key={index + 1}>
            <Col xs={1}>{row.index}.</Col>
            <Col xs={5}>{row.userName}</Col>
            <Col xs={5}>{row.firstName} {row.lastName}</Col>
          </Row>
        );
      });
    }

    if (this.invalidData) {
      invalidRows.push(
        <Row style={styles.grid} key={0}>
          <Col xs={1}></Col>
          <Col xs={3}>Username</Col>
          <Col xs={4}>Name</Col>
          <Col xs={4}>Reason</Col>
        </Row>
      );
      this.invalidData.forEach((row, index) => {
        invalidRows.push(
          <Row style={styles.grid} key={index + 1 * 10}>
            <Col xs={1}>{row.index}.</Col>
            <Col xs={3} style={row.userName === 'missing' ? styles.invalidCell : styles.validCell}>{row.userName}</Col>
            <Col xs={4}
                 style={row.firstName === 'missing' || row.lastName === 'missing' ? styles.invalidCell : styles.validCell}>{row.firstName} {row.lastName}</Col>
            <Col xs={4}>{row.reason}</Col>
          </Row>
        );
      });
    }
    return (
      <div style={styles.body}>
        <div style={styles.heading}>
          <div style={styles.title}>
            Bulk {this.userType === 'staff' ? 'Healthcare Professional' : 'Patient'} Creation
            <IconButton
              tooltip="Click here for detailed instructions"
              touch={true}
              style={styles.helpIconButton}
              onClick={this.goToInstructions}
            >
              <HelpIcon />
            </IconButton>
          </div>
          <div style={styles.actionBar}>
            <FlatButton label={'List'} style={styles.actionText}
                        icon={<ListIcon style={styles.actionIcon}/>}
                        href="#/healthcareprofessionals"
            />
            <FlatButton label={'Clear'} style={styles.actionText}
                        icon={<ClearIcon style={styles.actionIcon}/>}
                        onClick={this.resetHot}
            />
          </div>
          <div style={styles.dropContainer} className="dropzone">
            <Dropzone id="body" style={drag ? styles.dragDropzone : styles.dropzone}
                      accept='.xls,.xlsx'
                      onDrop={this.onDrop.bind(this)}
                      onDragOver={this.handleDragover}
                      onDragLeave={this.handleDragleave}
                      disabled={this.state.dropDisabled}
            >
              <p>{this.state.dropMessage}</p>
            </Dropzone>
          </div>
        </div>
        <div>
          {
            this.state.file &&
              <div>
                <div style={styles.subtitle}>Users to create:</div>
                <div id={this.state.file.name}
                     style={this.state.message === 'Success' ? styles.fileStatus : styles.fileStatusError}>{this.state.file.name}
                  - {this.state.file.size} bytes; {this.state.message}</div>
              </div>
          }
          <div style={styles.buttonWrapper}>
            <SelectField
              value={this.state.facility}
              onChange={this.handleOrgChange}
              floatingLabelText="Organization"
              floatingLabelFixed
              hintText="Select organization"
              style={styles.orgSelect}
              floatingLabelStyle={styles.floatingLabelStyle}
              selectedMenuItemStyle={styles.selectedMenuItemStyle}
            >
              {
                this.state.facilities ?
                  this.state.facilities.map((facility, index) => (
                    <MenuItem key={facility.id || index} value={facility.name} primaryText={facility.name} />
                  ))
                  :
                  ''
              }
            </SelectField>
            {this.userType !== 'staff' &&
              <SelectField
                value={this.state.preset}
                onChange={this.handlePresetChange}
                floatingLabelText="User Template"
                floatingLabelFixed
                hintText="Apply User Template"
                style={styles.orgSelect}
                floatingLabelStyle={styles.floatingLabelStyle}
                selectedMenuItemStyle={styles.selectedMenuItemStyle}
              >
                {
                  this.state.presets ?
                    this.state.presets.map((preset, index) => (
                      <MenuItem key={preset.id || index} value={preset.id} primaryText={preset.name} />
                    ))
                    :
                    ''
                }
              </SelectField>
            }
            <FlatButton label={'Validate Users'}
                        icon={<SubmitIcon style={styles.actionIcon}/>}
                        onClick={this.handleValidateUsers}
                        style={styles.validateButton}
            />
          </div>
          <div style={styles.hotTable}>
            {this.state.objectData ?
              <div>
                <HotTable
                  root='hot'
                  ref='hot'
                  data={this.state.objectData}
                  colHeaders={this.state.colHeaders}
                  columns={[
                    {}, {}, {
                      validator: (value, callback) => {
                        if (!value) {
                          callback(true);
                        } else {
                          let re = /^\S{8,}$/;
                          callback(re.test(value));
                        }
                      }
                    }, {
                      validator: (value, callback) => {
                        if (!value) {
                          callback(true);
                        } else {
                          let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
                          callback(re.test(value));
                        }
                      }
                    }, {
                      validator: (value, callback) => {
                        if (!value) {
                          callback(true);
                        } else {
                          let re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
                          callback(re.test(value));
                        }
                      }
                    }, ...(this.userType === 'staff' ?
                    [{
                      validator: (value, callback) => {
                        if (!value) {
                          callback(true);
                        } else {
                          let re = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
                          callback(re.test(value));
                        }
                      }
                    }] : []),
                  ]}
                  afterValidate={
                    (isValid, value, row, col, source) => {
                      let hot = this.refs.hot ? this.refs.hot.hotInstance : null,
                        userNames = hot.getDataAtCol(2),
                        itemRow = userNames.indexOf(value);

                      if(col === 2 && !hot.isEmptyRow(row) && itemRow !== row) {
                        return false;
                      }
                      return true;
                    }
                  }
                  rowHeaders={true}
                  width={window.innerWidth - 350}
                  height={this.state.file ? window.innerHeight - 420 : window.innerHeight - 580}
                  stretchH="all"
                  contextMenu={true}
                  autoWrapRow={true}
                  autoWrapCol={true}
                  minSpareRows={1}
                  allowInsertColumn={false}
                  allowRemoveColumn={false}
                  allowEmpty={false}
                  maxRows={50}
                  maxCols={this.userType === 'staff' ? 6 : 5}
                />
              </div>
              : ''}
          </div>
          <div id="instructions" style={styles.instructions}>
            <div><b>Instructions</b>:</div>
            <div style={styles.instructionSub}>Adding users is simple. First, choose the Organization below, then you may either freetype or copy and paste
              your users into
              the blank spreadsheet below OR enter your users into this&nbsp;
              <a href='/users_example.xls'
                  style={this.state.templateOver ? styles.templateOver : styles.templateAnchor}
                  onMouseEnter={this.handleTemplateEnter}
                  onMouseLeave={this.handleTemplateLeave}>bulk template</a>
              , then drag and drop it into the drop zone above. <u>Make sure your columns match the column headers
                listed.</u>&nbsp;
              After that, click on the 'VALIDATE USERS' button below to continue.
            </div>
            <div style={styles.notes}><b>Notes</b>:
              <ul style={styles.instructionReq}>
                <li>Bulk user creation is limited to 50 users at a time. Each user will take 5-10 seconds to syncronize contact lists, so please be patient and do not refresh the browser while processing users.</li>
                <li>All fields are required, but if you would like us to auto-generate user names for you, leave the userName field blank and we'll generate user names when you click 'VALIDATE USERS'.</li>
                <li>Usernames must be 8 or more characters in length.</li>
                <li>For groups over 200 users, please work with IMYD Customer Service team to ensure proper configuration.</li>
              </ul>
            </div>
          </div>
          <Dialog
            title="User Validation"
            actions={dialogActions}
            modal={true}
            open={this.state.dialogOpen}
            onRequestClose={this.handleDialogClose}
            autoScrollBodyContent={true}
          >
            <div
              style={styles.instructions}>{this.state.validationMessage !== '' ? 'Note: Some pre-existing usernames have been incremented: ' + this.state.validationMessage : ''}</div>
            <div style={styles.instructions}>{this.state.autoUserMessage}</div>
            <div style={styles.validTitle}>
              {!this.hotValid ? 'Validated Users' : 'All users validated, click "Add Users" to continue.'}
            </div>
            <Grid fluid>
              {rows}
            </Grid>
            {!this.hotValid ?
              <div>
                <div style={styles.invalidTitle}>Validation Failed</div>
                <div style={styles.invalidInstructions}>(Please go back to the user list, fix or remove the failed users
                  and then you may 'Add Users'.)
                </div>
                <Grid fluid>
                  {invalidRows}
                </Grid>
              </div>
              : ''}
          </Dialog>
        </div>
      </div>
    );
  }
};

export default withRouter(UserBulk);