// in src/Menu.js
import React from 'react';
import { MenuItemLink } from 'admin-on-rest';
import FlatButton from 'material-ui/FlatButton';

import DashIcon from 'material-ui/svg-icons/action/dashboard';
import HPIcon from 'material-ui/svg-icons/social/group';
import PatientIcon from 'material-ui/svg-icons/action/face';
import ConvoIcon from 'material-ui/svg-icons/communication/chat';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import SwapVertIcon from 'material-ui/svg-icons/action/swap-vert';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';

import configs from './js/configs';

import ReactDOM from 'react-dom';
import { getUserSubscription } from './services/Subscriptions';
import Tooltip from './components/user_management/tooltip';

const styles = {
  flatButton: {
    position: 'relative',
    minWidth: '100%',
    minHeight: 48,
    textAlign: 'left',
    color: '#9ccd21'
  },
  disable: {
      color: '#C7C7C7'
  }
};

const backToWebChat = () => {
  window.location = configs.chatURL;
}

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            disableEMR:true
        };

        getUserSubscription()
            .then(subscription => {
                this.setState({
                    disableEMR: subscription.data.subscriptionType.toLowerCase() == 'free'
                });
            });
    }

    handleMouseOverDisabledOption(event) {
        this._popup = document.createElement('div');
        this._popup.style.width = '200px';
        document.body.appendChild(this._popup);
        this._renderTooltip(event);
    }

    handleMouseOutDisabledOption(event) {
        try {
            ReactDOM.unmountComponentAtNode(this._popup);
            document.body.removeChild(this._popup);
        } catch(error) {

        }

    }

    _renderTooltip(event) {
        let that = this;
        ReactDOM.render(
            <Tooltip width={170}
                     text={"This feature requires a paid subscription. Learn more"}
                     background="#838383"
                     position={{x: event.screenX, y: event.screenY}}
            />,
            this._popup
        );
    }

    render(){

        return (<div>
                <MenuItemLink to="/" primaryText="Dashboard" leftIcon={<DashIcon/>} onClick={this.props.onMenuTap} />
                <MenuItemLink to="/healthcareprofessionals" primaryText="Healthcare Professionals" leftIcon={<HPIcon/>} onClick={this.props.onMenuTap} />
                <MenuItemLink to="/patients" primaryText="Patients" leftIcon={<PatientIcon/>} onClick={this.props.onMenuTap} />
                <MenuItemLink to="/conversations" primaryText="My Conversations" leftIcon={<ConvoIcon/>} onClick={this.props.onMenuTap} />
                <MenuItemLink to="/presets" primaryText="User Templates" leftIcon={<SettingsIcon/>} onClick={this.props.onMenuTap} />
            {this.state.disableEMR
                &&
                <MenuItemLink to={""}
                              primaryText="EMR Integration"
                              leftIcon={<SwapVertIcon/>}
                              onClick={this.props.onMenuTap}
                              style={styles.disable}
                              onMouseEnter={
                                  (event) => {
                                      this.handleMouseOverDisabledOption(event);
                                  }
                              }
                              onMouseOut={
                                  (event) => {
                                      this.handleMouseOutDisabledOption(event);
                                  }
                              }
                />
                ||
                <MenuItemLink to={"/emrintegration"}
                              primaryText="EMR Integration"
                              leftIcon={<SwapVertIcon/>}
                              onClick={this.props.onMenuTap}
                />
            }

                {configs.mode === 'development' ?
                    this.props.logout
                    :
                    <FlatButton
                        icon={<BackIcon/>}
                        labelPosition="after"
                        style={styles.flatButton}
                        onClick={backToWebChat}
                        label="Back to WebChat"
                        onTouchTap={backToWebChat}
                    />
                }
            </div>
        );
    }
}

export default ({ resources, onMenuTap, logout }) => {
    return <Menu onMenuTap={onMenuTap} logout={logout}/>;
}