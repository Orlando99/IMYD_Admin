// in src/OrgUserConvos.js
import _ from 'underscore';
import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import FileSaver from 'file-saver';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import CircularProgress from 'material-ui/CircularProgress';
import Checkbox from 'material-ui/Checkbox';
import Snackbar from 'material-ui/Snackbar';
import { CREATE } from 'admin-on-rest';

import EMRExportDialog from './components/dialogs/EMRExportDialog';
import restClient from './IMYD-REST-Client';
import { Row, Col } from 'react-flexbox-grid';
import configs from './js/configs';

import json2csv from 'json2csv';
import Utility from './js/utilities';


import fireImage from './img/fire.svg';

const ProfilePhotoField = ({record = {}}) => <img width="50px" height="50px" alt="Profile"
                                                  src={`${configs.imageUrl}/profilepic.php?user_name=${record.username}`}/>;
ProfilePhotoField.defaultProps = {label: 'Name'};

const MembersField = ({record = {}}) => <div>{record.members ? record.members.join(', ') : ''}</div>;
MembersField.defaultProps = { label: 'Members' };

class MessageDisplay extends Component {
  render() {
    const styles = {
      image: {
        display: 'block',
        width: '100%'
      }
    }

    const message = this.props.message;
    if (message.text.length > 100 && message.text.indexOf(' ') < 0) {
      return (
        <img
          alt="Message"
          style={styles.image}
          src={"data:image/png;base64," + message.text}/>
      );
    } else {
      return (
        <div>{message.text}</div>
      );
    }
  }
}

class RenderMessages extends Component {

  constructor(props) {
    super(props);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.convoCaller = this.props.convoCaller;
    this.page = 1;
    this.previousHeight = 0;
    this.scrollPosition = 0;
    this.scrollHeight = 0;
    this.totalRecords = this.props.state.totalRecords;
    this.state = {
      selectedMessages: [],
      lastInteractedMessage: null,
      emrExportDialogOpen: false,
      emrExportResultToastOpen: false,
      emrExportResultToastMessage: '',
    };
  }

  componentDidMount() {
    const _this = this,
      messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
    let updated = false;

    this.previousHeight = messagesContainer.scrollHeight;

    $(ReactDOM.findDOMNode(this.messagesContainer)).scroll(function() {
      // Set the scrollPostion to control the scroll when new records are added
      _this.scrollPosition = $(this).scrollTop();

      if(!updated && $(this).scrollTop() <= 0) {
        const recordSet = _this.props.state.record;
        updated = true;
        const orgUserConvoRecord = JSON.parse(localStorage.getItem('IMYD.orgUserConvoRecord'));

        if(_this.totalRecords > _this.props.state.record.length && orgUserConvoRecord) {
          let path;
          if (_this.props.convoCaller === 'myconversations') {
            path = `communication/${Utility.parseJWT().username}/in/${orgUserConvoRecord.type}/${orgUserConvoRecord.username}/filter`;
          } else {
            path = `communication/${orgUserConvoRecord.username}/in/${orgUserConvoRecord.type}/${orgUserConvoRecord.name}/filter`;
          }

          _this.props.handleParentState({
            loading: true
          });
          restClient('GET', path, {
            sort: 'mid,desc',
            page: _this.page,
            size: 20
          })
            .then(result => {
              _this.props.handleParentState({
                record: [..._.sortBy(result.data, 'timestamp'), ...recordSet],
                username: orgUserConvoRecord.username,
                name: orgUserConvoRecord.name,
                loading: false
              });
              updated = false;
              _this.page++;

              if(_this.scrollHeight > 0) {
                _this.previousHeight = _this.scrollHeight;
              }
              _this.scrollHeight = messagesContainer.scrollHeight;
              let newHeight = _this.scrollHeight - _this.previousHeight;
              if(newHeight > 0) {
                _this.scrollToHeight(newHeight);
              }
            });
        }
      }
    });

    if(!updated) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    if (this.props.state.record) {
      const messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  scrollToHeight = (height) => {
    if (this.props.state.record) {
      const messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
      messagesContainer.scrollTop = height;
    }
  };

  toggleSelectMessage = (message, index, checked, event) => {
    const elId = message.timestamp + '-' + index;
    const { selectedMessages, lastInteractedMessage } = this.state;
    let clean = [];
    let interactedMessage = null;

    if (event.nativeEvent.shiftKey && lastInteractedMessage) {
      const startPos = Math.min(index, lastInteractedMessage.index);
      const endPos = Math.max(index, lastInteractedMessage.index);
      const changeSet = this.props.state.record.slice(startPos, endPos + 1)
        .map((m, i) => `${m.timestamp}-${startPos + i}`);
      clean = checked ? _.union(selectedMessages, changeSet) :
        _.difference(selectedMessages, changeSet);
    } else {
      clean = checked ? _.union(selectedMessages, [elId]) : _.without(selectedMessages, elId);
      if (checked) {
        // el.style.backgroundColor = 'rgb(218, 236, 170)';
      } else {
        // el.style.backgroundColor = 'rgb(245, 245, 245)';
      }
      interactedMessage = { index, checked };
    }
    this.setState({
      selectedMessages: clean,
      lastInteractedMessage: interactedMessage || this.state.lastInteractedMessage,
    });
  };

  toggleAllMessages = (e, checked) => {
    this.setState({
      selectedMessages: checked ? this.props.state.record.map((m, i) =>
        `${m.timestamp}-${i}`) : [],
      allMessagesSelected: checked,
      lastInteractedMessage: null,
    });
  }

  adjustMessageWidth = (username, message) => {
    const styles = {
      messageLeft: {
        cursor: 'pointer',
        height: 'auto',
        color: '#fff',
        backgroundColor: '#535457',
        borderRadius: 10,
        padding: '15px',
        margin: '20px 10px',
        maxWidth: '50%',
      },
      messageRight: {
        cursor: 'pointer',
        height: 'auto',
        color: '#fff',
        backgroundColor: '#9ccd20',
        borderRadius: 10,
        padding: '15px',
        margin: '20px 10px',
        maxWidth: '50%',
      }
    };

    const myUser = username === message.sender.username;
      
    return myUser ? styles.messageRight : styles.messageLeft;
  };

  makePDF = (username, name, record) => {
    const maxLines = 48,
      messages = record,
      orgUserConvoRecord = JSON.parse(localStorage.getItem('IMYD.orgUserConvoRecord'));

    let
      title = 'IMYD_pdf',
      y = 10,
      doc = new window.jsPDF(),
      numLines = 1,
      previousParagraphSize = 1,
      x = 10,
      currentPage = 1,
      documentObject = [],
      titleSet = false;

    messages.forEach((message, index) => {
      const myUser = username === message.sender.username;
      let splitMessage, messageHeight;

      if (numLines >= maxLines) {
        currentPage++;
        numLines = 1;
        y = 10;
      }

      if (myUser) {
        x = 60;
      } else {
        x = 10
      }

      if (previousParagraphSize > 1) {
        y += 4 * previousParagraphSize;
      }

      if (this.state.selectedMessages.length === 0 || this.state.selectedMessages.indexOf(message.timestamp + '-' + index) >= 0) {
        if (!(message.text.length > 1000 && message.text.indexOf(' ') < 0)) {

          if(!titleSet) {
            title = this.props.state.type === 'ONE_TO_ONE' ?
              this.props.state.convoCaller === 'myconversations' ?
                `Conversation with ${orgUserConvoRecord.name}` :
              `Conversation between ${orgUserConvoRecord.name + ' and ' + this.props.state.username}` :
              `Group Conversation: ${name || ``}`

            let messageHeight = 1;

            // Add message object for text here
            documentObject.push({
              myUser,
              payload: title,
              type: 'title',
              x,
              y,
              width: 140,
              height: messageHeight,
              xRadius: 2,
              yRadius: 2,
              style: 'F',
              pageNumber: currentPage,
              meta: ''
            });
            y += 8;
            titleSet = true;
          }

          let meta = moment(message.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) + ', ' + message.sender.username;
          splitMessage = doc.splitTextToSize(message.text, 210);
          messageHeight = splitMessage.length * 6;

          // Add message object for text here
          documentObject.push({
            myUser,
            payload: splitMessage,
            type: 'text',
            x,
            y,
            width: 140,
            height: messageHeight,
            xRadius: 2,
            yRadius: 2,
            style: 'F',
            pageNumber: currentPage,
            meta
          });

          y += 10;
          numLines += splitMessage.length + 1;
          previousParagraphSize = splitMessage.length;
        } else {
          let meta = moment(message.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT) + ', ' + message.sender.username;

          // console.log('Image:',message.text);
          const encoding = message.text.slice(0, 4);
          let type = '', canRender = false;
          switch (encoding) {
            case "/9j/":
              type = 'JPEG';
              canRender = true;
              break;
            case 'iVBO':
              type = 'PNG';
              canRender = true;
              break;
            default:
              type = 'JPEG';
              canRender = true;
              break;
          }

          if (canRender) {
            let myImage = new Image();
            myImage.src = 'data:image/' + type + ';base64,' + message.text.toString();
            myImage.width = 130;

            if (numLines <= 20) {
              myImage.coordinates = {x: x, y: y};
              myImage.currentPage = currentPage;
              numLines += 11;
              y += 84;
            } else {
              currentPage++;
              numLines = 1;
              y = 10;
              myImage.coordinates = {x: x, y: y};
              myImage.currentPage = currentPage;
              numLines += 11;
              y += 84;
            }

            myImage.onload = function (event) {
              // Add message object for image here
              const ratio = this.naturalHeight / this.naturalWidth;
              documentObject.push({
                myUser,
                payload: myImage.src,
                type,
                x: this.coordinates.x,
                y: this.coordinates.y,
                width: Math.round(80 / ratio),
                height: 80,
                xRadius: 2,
                yRadius: 2,
                style: null,
                pageNumber: this.currentPage,
                meta
              });
            };
          }
        }
      }
    });

    setTimeout(() => {

      // Start processing the documentObject into a PDF
      doc.setFontSize(10);

      let pages = [1];
      documentObject.forEach((message) => {
        // New page found, add a page
        if (_.indexOf(pages, message.pageNumber) < 0) {
          pages.push(message.pageNumber);
          doc.addPage();
        }

        if(message.type === 'title') {
          doc.setFontSize(18);
          doc.setPage(message.pageNumber);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(message.x, message.y, 140, message.height, 1, 1, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text(message.payload, message.x + 2, message.y + 3.2, null);
        }
        else if (message.type === 'text') {
          doc.setFontSize(10);
          doc.setPage(message.pageNumber);
          if (message.myUser) {
            doc.setFillColor(156, 205, 33);
          } else {
            doc.setFillColor(80, 80, 80);
          }
          doc.roundedRect(message.x, message.y, 140, message.height, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(message.payload, message.x + 2, message.y + 3.2 + message.payload.length, null);

          // To add URLs
          // doc.textWithLink('Click here', message.x + 2, message.y + 3.2 + message.payload.length, { url: 'http://www.google.com' });

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(7);
          doc.text(message.meta, message.x + 2, message.y + 1.5 + message.payload.length + message.height, null);
        } else {
          // console.log('image:', message.x + 2, message.y, message.width, message.height, message.payload);
          doc.setPage(message.pageNumber);
          if (message.myUser) {
            doc.setFillColor(156, 205, 33);
          } else {
            doc.setFillColor(80, 80, 80);
          }
          doc.roundedRect(message.x, message.y - 1, message.width + 4, 82, 1, 1, 'F');
          doc.addImage(message.payload, message.type, message.x + 2, message.y, message.width, message.height - 1);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(7);
          doc.text(message.meta, message.x + 2, message.y + 83, null);
        }
      });
      // console.log(doc.output());
      doc.save(title + '.pdf');
    }, 1000);
  };

  exportCSV = (username, name, record) => {
    const messages = record,
      orgUserConvoRecord = JSON.parse(localStorage.getItem('IMYD.orgUserConvoRecord'));
    let updatedMessages = [], title, titleSet = false;
    messages.forEach((message, index) => {

      if(!titleSet) {
        title = this.props.state.type === 'ONE_TO_ONE' ?
          this.props.state.convoCaller === 'myconversations' ?
            `Conversation with ${orgUserConvoRecord.name}` :
          `Conversation between ${orgUserConvoRecord.name + ' and ' + this.props.state.username}` :
          `Group Conversation: ${name || ``}`;
        // updatedMessages.push({Sender: title});
        titleSet = true;
      }

      if ((this.state.selectedMessages.length === 0 && message.text.length < 1000 )|| this.state.selectedMessages.indexOf(message.timestamp + '-' + index) >= 0) {
        let timestamp = moment(message.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT);
        updatedMessages.push({Sender: message.sender.username, Message_Text: message.text, Date: timestamp})
      }
    });
    let csv = json2csv({data: updatedMessages, fields: ['Sender', 'Message_Text', 'Date']});
    var csvBlob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(csvBlob, `${title}.csv`);
  };

  exportText = (username, name, record) => {
    const messages = record,
      orgUserConvoRecord = JSON.parse(localStorage.getItem('IMYD.orgUserConvoRecord'));
    let updatedMessages = [], title, titleSet = false;
    messages.forEach((message, index) => {

      if(!titleSet) {
        title = this.props.state.type === 'ONE_TO_ONE' ?
          this.props.state.convoCaller === 'myconversations' ?
            `Conversation with ${orgUserConvoRecord.name}` :
          `Conversation between ${orgUserConvoRecord.name + ' and ' + this.props.state.username}` :
          `Group Conversation: ${name || ``}`;
        updatedMessages.push(title);
        titleSet = true;
      }

      if ((this.state.selectedMessages.length === 0 && message.text.length < 1000 )|| this.state.selectedMessages.indexOf(message.timestamp + '-' + index) >= 0) {
        let timestamp = moment(message.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT);
        updatedMessages.push(message.sender.username + ' (' + timestamp + '): ' + message.text);
      }
    });
    const text = updatedMessages.join('\n');
    const textBlob = new Blob([text], {type: 'text/plain'});
    // var hiddenElement = document.createElement('a');

    // hiddenElement.href = textFile; // 'data:attachment/text,' + encodeURI(text);
    // hiddenElement.target = '_blank';
    // hiddenElement.download = title + '.text';
    // hiddenElement.click();
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(textBlob);
    }
    else {
      const textFile = window.URL.createObjectURL(textBlob);
      window.open(textFile, '_blank');
    }
  };

  exportToEMR = (patient, practitionerOrPracticeId) => {
    const { selectedMessages, allMessagesSelected } = this.state;
    console.log(practitionerOrPracticeId);
    if (patient) {
      const { patientId, practiceId } = patient;
      // console.log('message props: ', this.props);
      const exportData = { patientId, practitionerOrPracticeId, threadName: this.props.state.id };
      exportData.threadName = this.props.state.id;
      if (!allMessagesSelected) {
        exportData.messageIds = (this.props.state.record || []).filter((m, i) =>
          selectedMessages.includes(`${m.timestamp}-${i}`)).map(m => m.messageId);
      }
      console.log('export data: ', exportData);
      restClient(CREATE, 'emrintegration/export', { data: exportData })
        .then(result => {
          this.setState({
            emrExportDialogOpen: false,
            emrExportResultToastOpen: true,
            emrExportResultToastMessage: `Transcript saved to chart of ${patient.text}.`,
          });
        });
    } else {
      this.setState({ emrExportDialogOpen: false });
    }
  }

  onOpenEMRExportDialog = () => {
    const { selectedMessages, allMessagesSelected } = this.state;
    if (selectedMessages.length > 0 || allMessagesSelected) {
      this.toggleEMRExportDialog();
    } else {
      this.setState({
        emrExportDialogOpen: false,
        emrExportResultToastOpen: true,
        emrExportResultToastMessage: `Please select at least one message to export.`,
      });
    }
  }

  toggleEMRExportDialog = () =>
    this.setState({ emrExportDialogOpen: !this.state.emrExportDialogOpen })

  handleEMRExportResultToastClose = () => this.setState({ emrExportResultToastOpen: false })

  render() {
    if (this.props.state.record) {
      const
        windowHeight = window.innerHeight,
        username = this.props.convoCaller === 'myconversations' ? Utility.parseJWT().username :
          (JSON.parse(localStorage.getItem('IMYD.convoUsername')) || {}).username,
        styles = {
          messageContainer: {
            borderTop: '1px solid #ccc',
            height: windowHeight - 225,
            overflowY: 'auto',
            margin: 0,
            padding: '5px 15px 5px 5px',
            maxWidth: 1520,
            width: '100%',
            boxSizing: 'border-box',
          },
          message: {
            backgroundColor: 'rgb(245, 245, 245)',
            display: 'flex',
            alignItems: 'flex-end',
            width: '100%',
            position: 'relative',
          },
          activeMessage: {
            backgroundColor: 'rgb(218, 236, 170)',
          },
          messageRight: {
            justifyContent: 'flex-end',
          },
          photoLeft: {
            borderRadius: 30,
            marginRight: '5px',
            marginBottom: '10px',
          },
          photoRight: {
            borderRadius: 30,
            marginLeft: '5px',
            marginBottom: '10px',
          },
          subDate: {
            fontSize: '.8em',
            color: '#ddd',
            margin: '5px 0 0 0',
            padding: '5px 0 0 0',
            position: 'relative'
          },
          visible: {
            display: 'block'
          },
          hidden: {
            display: 'none'
          },
          endMessages: {
            textAlign: 'center'
          },
          export: {
            textAlign: 'center',
            position: 'fixed',
            bottom: 12
          },
          flatButtonLeft: {
            color: '#a4c639',
            margin: 4,
            top: 5,
            right: 171
          },
          flatButtonRight: {
            color: '#a4c639',
            margin: 4,
            top: 5,
            right: 171
          },
          checkbox: {
            display: 'inline-block',
            alignSelf: 'center',
            width: 'auto',
          },
          emrIcon: {
            transform: 'rotate(-90deg)',
          },
          fireIcon: {
            width: 20,
            height: 20,
            transform: 'translate(-8px, 4px)',
          },
        };

      const windowWidth = window.innerWidth;
      let right = 171, containerHeight = windowHeight - 225;
      if (windowWidth < 768) {
        right = 35;
        containerHeight = 'auto';
      }
      styles.messageContainer.height = containerHeight;
      styles.flatButtonLeft.right = right;
      styles.flatButtonRight.right = right;
      const { selectedMessages } = this.state;

      return (
        <div>
          <Checkbox
            label="Select all messages"
            style={{ ...styles.checkbox, width: 210, paddingLeft: 5 }}
            onCheck={this.toggleAllMessages}
          />
          <div className="message-container" ref={(el) => { this.messagesContainer = el; }}
              style={styles.messageContainer}
          >
            {this.props.state.record.map((message, i) => {
              const isCurrentUser = username === message.sender.username;
              const isSelected = selectedMessages.includes(`${message.timestamp}-${i}`);
              return (
                <div
                  key={message.timestamp + ' ' + i}
                  id={message.timestamp + '-' + i}
                  className="bypass"
                  style={{
                    ...styles.message,
                    ...(isCurrentUser ? styles.messageRight : {}),
                    ...(isSelected ? styles.activeMessage : {}),
                  }}
                >
                  {!isCurrentUser &&
                    <Checkbox
                      checked={isSelected}
                      style={styles.checkbox}
                      onCheck={(e, c) => this.toggleSelectMessage(message, i, c, e)}
                    />
                  }
                  {!isCurrentUser &&
                    <img
                      src={`${configs.imageUrl}/profilepic.php?user_name=${message.sender.username}`}
                      width="50px"
                      height="50px"
                      alt=""
                      style={styles.photoLeft}
                    />
                  }
                  <div
                    className={`messageBody ${isCurrentUser ? 'right' : 'left'}`}
                    style={this.adjustMessageWidth(username, message)}
                  >
                    <MessageDisplay message={message}/>
                    <div style={styles.subDate}>
                      {moment(message.timestamp, 'YYYY-MM-DD HH:mm:ss Z').format(Utility.IMYD_DATETIME_FORMAT)}, {message.sender.username}
                    </div>
                  </div>
                  {isCurrentUser &&
                    <img
                      src={`${configs.imageUrl}/profilepic.php?user_name=${message.sender.username}`}
                      width="50px"
                      height="50px"
                      alt=""
                      style={styles.photoRight}
                    />
                  }
                  {isCurrentUser &&
                    <Checkbox
                      checked={isSelected}
                      style={styles.checkbox}
                      onCheck={(e, c) => this.toggleSelectMessage(message, i, c, e)}
                    />
                  }
                </div>
              );
            })}
            <div style={styles.export}>
              <RaisedButton
                icon={<FileDownload/>}
                style={styles.flatButtonLeft}
                onClick={() => this.makePDF(username, this.props.state.fullname || this.props.state.name,
                  this.props.state.record)}
                label="PDF"
                labelPosition="after"
              />
              <RaisedButton
                icon={<FileDownload/>}
                style={styles.flatButtonRight}
                onClick={() => this.exportText(username, this.props.state.fullname || this.props.state.name,
                  this.props.state.record)}
                label="TEXT"
                labelPosition="after"
              />
              <RaisedButton
                icon={<FileDownload/>}
                style={styles.flatButtonRight}
                onClick={() => this.exportCSV(username, this.props.state.fullname || this.props.state.name,
                  this.props.state.record)}
                label="CSV"
                labelPosition="after"
              />
              {this.props.state.emrEnabled &&
                <RaisedButton
                  icon={<FileDownload style={styles.emrIcon} />}
                  style={styles.flatButtonRight}
                  onClick={this.onOpenEMRExportDialog}
                  label="EXPORT TO EMR"
                  labelPosition="before"
                >
                </RaisedButton>
              }
            </div>
          </div>
          {this.props.state.emrEnabled &&
            <EMRExportDialog
              open={this.state.emrExportDialogOpen}
              onSubmit={this.exportToEMR}
              onDismiss={this.toggleEMRExportDialog}
            />
          }
          <Snackbar
            open={this.state.emrExportResultToastOpen}
            message={this.state.emrExportResultToastMessage}
            action="DISMISS"
            autoHideDuration={4000}
            onActionClick={this.handleEMRExportResultToastClose}
            onRequestClose={this.handleEMRExportResultToastClose}
          />
        </div>
      );
    } else {
      return null;
    }
  }
}

export default class OrgUserConvoShow extends Component {

  constructor(props) {
    super(props);

    this.handleParentState = this.handleParentState.bind(this);
  }

  componentWillMount() {
    const orgUserConvoRecord = JSON.parse(localStorage.getItem('IMYD.orgUserConvoRecord')),
      convoCaller = this.props.match.params.type;

    if(orgUserConvoRecord) {
      let path;
      if (convoCaller === 'myconversations') {
        path = `communication/${Utility.parseJWT().username}/in/${orgUserConvoRecord.type}/${orgUserConvoRecord.username}/filter`;
      } else {
        path = `communication/${orgUserConvoRecord.username}/in/${orgUserConvoRecord.type}/${orgUserConvoRecord.name}/filter`;
      }
      Promise.all([
        restClient('GET', path, {
          sort: 'mid,desc',
          page: 0,
          size: 20
        }),
        restClient('GET_SETTINGS', 'settings/enabledFeatures', {}),
      ]).then((results) => {
        const [result, features] = results;
        this.setState({
          totalRecords: result.total,
          record: _.sortBy(result.data, 'timestamp'),
          username: orgUserConvoRecord.username,
          fullname: orgUserConvoRecord.fullname,
          name: orgUserConvoRecord.name,
          id: orgUserConvoRecord.id,
          updated: orgUserConvoRecord.updated,
          type: orgUserConvoRecord.type,
          convoCaller: this.props.match.params.type,
          emrEnabled: (features.data || {}).emrIntegration === 'FHIR' || (features.data || {}).emrIntegration === 'INTERGY',
        });
      });
    }
  }

  handleParentState(stateObject) {
    this.setState(stateObject);
  }

  render() {

    const styles = {
      heading: {
        padding: '16px'
      },
      title: {
        fontSize: '24px',
        color: 'rgba(0, 0, 0, 0.87)',
        display: 'block',
        lineHeight: '36px',
      },
      body: {
        overflowY: 'auto',
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
        backgroundColor: 'rgb(245, 245, 245)'
      },
      actionText: {
        color: '#9ccd21'
      },
      actionIcon: {
        fill: '#9ccd21'
      },
      convoBody: {
        padding: '0px 1em 1em'
      },
      loading: {
        top: '20px',
        left: '20px',
        padding: '5px',
        color: '#fff'
      }
    };

    if(this.state) {
      const convoCaller = this.props.match.params.type;

      return (
        <div style={styles.body}>
          <div style={styles.heading}>
            <Row>
              <Col xs={8} md={10} style={styles.title}>
                {this.state.type === 'ONE_TO_ONE' ?
                  convoCaller === 'myconversations' ?
                    `Conversation with ${this.state.name}` :
                  `Conversation between ${this.state.name + ' and ' + this.state.fullname + ' (' + this.state.username + ')'}` :
                  `Group Conversation: ${this.state.fullname || this.state.name || ''}`
                }
              </Col>
              <Col xs={4} md={2}>
                {
                  convoCaller === 'myconversations' ?
                    <FlatButton label={'Back'} style={styles.actionText} icon={<BackIcon style={styles.actionIcon}/>}
                                href="#/conversations"/> :
                    <FlatButton label={'Back'} style={styles.actionText} icon={<BackIcon style={styles.actionIcon}/>}
                                href="#/userconvos"/>
                }
              </Col>
            </Row>
          </div>
          {
            this.state.record.length > 0 ?
            <div style={styles.convoBody}>
              {this.state.loading ? <CircularProgress size={25} thickness={3} style={styles.loading}/> : <div></div>}
              <RenderMessages state={this.state} convoCaller={this.state.convoCaller} handleParentState={(stateObject) => {this.handleParentState(stateObject);}}/>
            </div>
            :
            <div style={styles.convoBody}>No messages found.</div>
          }
        </div>
      );
    } else {
      return <CircularProgress size={40} thickness={2} style={styles.loading}/>;
    }
  };
};