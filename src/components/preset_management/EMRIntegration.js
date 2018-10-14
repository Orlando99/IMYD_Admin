import React, { Component } from 'react';
import { UPDATE } from 'admin-on-rest';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from 'material-ui/CircularProgress';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Snackbar from 'material-ui/Snackbar';
import _ from 'lodash';

import restClient from '../../IMYD-REST-Client';

const styles = {
  container: {
    backgroundColor: 'white',
    height: '100%',
    padding: 30,
    boxSizing: 'border-box',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: 'normal',
    margin: '0 20px 0 0',
  },
  form: {
    width: 450,
  },
  dropdownMenu: {
    backgroundColor: 'white',
  },
  inputField: {
    backgroundColor: '#EDECEC',
    marginBottom: 40,
  },
  fieldPadding: {
    paddingLeft: 16,
    paddingRight: 16,
    boxSizing: 'border-box',
  },
  relativeWrapper: {
    position: 'relative',
  },
  providerField: {
    backgroundColor: '#EDECEC',
  },
  providerPadding: {
    paddingLeft: 40,
    paddingRight: 40,
    boxSizing: 'border-box',
  },
  providerIcon: {
    position: 'absolute',
    left: 10,
    top: 11,
    zIndex: 10,
  },
  searchLoadingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  providerDescription: {
    color: 'gray',
    fontSize: 12,
    margin: '5px 0',
  },
  actionContainer: {
    marginTop: 40,
    textAlign: 'center',
  },
  savingIndicator: {
    display: 'block',
    margin: '10px auto',
  },
};

export default class EMRIntegrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      facilities: [],
      hospId: 0,
      defaultProviderFullName: '',
      defaultProviderId: '',
      defaultProvider: null,
      integrationType: '',
      previousIntegrationType: null,
      remoteApiUrl: '',
      remotePassword: '',
      remoteUsername: '',
      providers: [],
      loading: true,
      searchLoading: false,
      saving: false,
      snackbarVisible: false,
      snackbarMessage: '',
    };
    this.loadProviders = _.debounce(this.loadProviders, 300);
  }

  componentWillMount() {
    restClient('GET', `facilities`, {})
      .then(facilities => {
        this.setState({
          facilities: facilities.data,
          hospId: _.find(facilities.data, { primary: true }).pk.id,
        }, this.loadSettings);
      });
  }

  onSubmit = () => {
    const {
      integrationType, previousIntegrationType, remoteApiUrl, remotePassword, remoteUsername,
      defaultProviderFullName, defaultProviderId, defaultProvider, hospId,
    } = this.state;
    this.setState({ saving: true });
    restClient(UPDATE, `emrintegration`, {
      id: 'settings',
      data: {
        defaultProviderFullName: (defaultProvider || {}).lastName || defaultProviderFullName,
        defaultProviderId: (defaultProvider || {}).practitionerId || defaultProviderId,
        enabled: integrationType !== 'DISABLED',
        hospId,
        integrationType: integrationType === 'DISABLED' ? previousIntegrationType : integrationType,
        remoteApiUrl,
        ...(remotePassword ? { remotePassword } : {}),
        remoteUsername,
      },
    })
      .then((result) => {
        // console.log('saved settings: ', result);
        this.setState({
          snackbarVisible: true,
          snackbarMessage: 'Your EMR integration settings are updated successfully.',
        })
      })
      .finally(() => this.setState({ saving: false }));
  }

  handleOrgChange = (event,i, val) => {
    if (this.state.hospId !== val) {
      this.setState({ hospId: val }, this.loadSettings);
    }
  }

  handleIntegrationTypeChange = (event, i, val) => this.setState({
    integrationType: val,
    previousIntegrationType: val === 'DISABLED' ? this.state.integrationType : null,
  })

  handleTextInputChange = (field) => (event) => this.setState({ [field]: event.target.value })

  handleUpdateProvider = (searchText, data, params) =>
    this.setState({ defaultProviderFullName: searchText },
      params.source === 'change' ? this.loadProviders : null)

  handleNewRequestForProvider = (chosen, index) => {
    if (index === -1) {
      this.setState({ defaultProviderFullName: '', defaultProvider: null });
    } else {
      this.setState({ defaultProvider: chosen });
    }
  }

  handleRequestCloseSnackbar = () => this.setState({ snackbarVisible: false, snackbarMessage: '' })

  loadSettings = () => {
    this.setState({ loading: true });
    restClient('GET', `emrintegration/settings`, { hospId: this.state.hospId })
      .then((result) => {
        // console.log('loaded settings: ', result);
        const newState = {
          ...result.data,
          integrationType: result.data.enabled ? result.data.integrationType : 'DISABLED',
          previousIntegrationType: result.data.enabled ? null : result.data.integrationType,
        }
        this.setState(newState);
      })
      .finally(() => this.setState({ loading: false }));
  }

  loadProviders = () => {
    const {
      hospId, integrationType, remoteApiUrl,
      remotePassword, remoteUsername, defaultProviderFullName,
    } = this.state;
    this.setState({ searchLoading: true });
    restClient('POST', `emrintegration/practitioners`, {
      data: {
        hospId,
        defaultProviderFullName,
        integrationType,
        remoteApiUrl,
        ...(remotePassword ? { remotePassword } : {}),
        remoteUsername,
      },
    })
      .then((results, err) => {
        if (results) {
          const transformedData = (results.data || []).map(p => ({
            ...p,
            fullName: `${p.firstName} ${p.lastName}`,
          }));
          this.setState({ providers: transformedData });
        }
      })
      .finally(() => this.setState({ searchLoading: false }));
  }

  render() {
    // console.log('current user: ', Utility.parseJWT());
    const {
      facilities, hospId, integrationType, remoteApiUrl, remotePassword, remoteUsername,
      defaultProviderFullName, defaultProviderId, defaultProvider, providers,
      loading, searchLoading, saving, snackbarVisible, snackbarMessage,
    } = this.state;
    const providerInputDisabled = !integrationType || !remoteApiUrl || !remoteUsername;
    return (
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <h2 style={styles.title}>EMR Integration Settings</h2>
          {loading && <CircularProgress size={30} />}
        </div>
        <div style={styles.form}>
          <SelectField
            hintText="Choose Organisation"
            value={hospId}
            fullWidth
            labelStyle={styles.fieldPadding}
            hintStyle={styles.fieldPadding}
            listStyle={styles.dropdownMenu}
            style={styles.inputField}
            onChange={this.handleOrgChange}
          >
            {facilities ? facilities.map((f, index) => (
                <MenuItem key={f.id || index} value={f.pk.id} primaryText={f.name} />
              ))
            :
              ''
            }
          </SelectField>
          <SelectField
            hintText="Choose EMR type"
            value={integrationType}
            fullWidth
            labelStyle={styles.fieldPadding}
            hintStyle={styles.fieldPadding}
            listStyle={styles.dropdownMenu}
            style={styles.inputField}
            onChange={this.handleIntegrationTypeChange}
          >
            <MenuItem value="CENTRICITY_FHIR" primaryText="Centricity FHIR" />
            <MenuItem value="DISABLED" primaryText="Disabled" />
          </SelectField>
          <TextField
            hintText="API URL"
            value={remoteApiUrl}
            disabled={integrationType === 'DISABLED'}
            underlineShow={false}
            fullWidth
            inputStyle={styles.fieldPadding}
            hintStyle={styles.fieldPadding}
            style={styles.inputField}
            onChange={this.handleTextInputChange('remoteApiUrl')}
          />
          <TextField
            hintText="Username"
            value={remoteUsername}
            disabled={integrationType === 'DISABLED'}
            underlineShow={false}
            fullWidth
            inputStyle={styles.fieldPadding}
            hintStyle={styles.fieldPadding}
            style={styles.inputField}
            onChange={this.handleTextInputChange('remoteUsername')}
          />
          <TextField
            type="password"
            hintText="Password"
            value={remotePassword}
            disabled={integrationType === 'DISABLED'}
            underlineShow={false}
            fullWidth
            inputStyle={styles.fieldPadding}
            hintStyle={styles.fieldPadding}
            style={styles.inputField}
            onChange={this.handleTextInputChange('remotePassword')}
          />
          <div style={styles.relativeWrapper}>
            <SearchIcon color="gray" style={styles.providerIcon} />
            <AutoComplete
              hintText="Default Provider"
              disabled={providerInputDisabled || integrationType === 'DISABLED'}
              searchText={defaultProviderFullName}
              dataSource={providers}
              dataSourceConfig={{ text: 'fullName', value: 'practitionerId' }}
              filter={AutoComplete.caseInsensitiveFilter}
              underlineShow={false}
              openOnFocus
              fullWidth
              inputStyle={styles.providerPadding}
              hintStyle={styles.providerPadding}
              style={styles.providerField}
              onUpdateInput={this.handleUpdateProvider}
              onNewRequest={this.handleNewRequestForProvider}
            />
            {searchLoading && <CircularProgress size={25} style={styles.searchLoadingIndicator} />}
          </div>
          <p style={styles.providerDescription}>
            This provider will be used as the the default author of items uploaded to the EMR.
          </p>
          <div style={styles.actionContainer}>
            <RaisedButton
              disabled={providerInputDisabled || !defaultProviderFullName ||
                (!defaultProviderId && !defaultProvider)}
              onClick={this.onSubmit}
              label="SAVE"
              primary
            />
            {saving && <CircularProgress size={30} style={styles.savingIndicator} />}
          </div>
        </div>
        <Snackbar
          open={snackbarVisible}
          message={snackbarMessage}
          autoHideDuration={8000}
          onRequestClose={this.handleRequestCloseSnackbar}
        />
      </div>
    );
  }
}