# Facility Admin Portal

[This project was bootstrapped with the Create React App](docs/create_react_app.md)

[And is based on Admin on Rest](https://github.com/marmelab/admin-on-rest)

<b>Getting Started with IMYourDoc Facility Admin Portal</b>

<h2>Requirements </h2>
<ul>
	<li>Node v7.10.0 or later</li>
	<li>yarn</li>
	<!--<li>SSL certs (self signed-OK for development, see https://nodejs.org/api/tls.htmlhttps://nodejs.org/api/tls.html)</li>
	<li>For cookies to work, either deploy on an imyourdoc.com server or create a `me.imyourdoc.com 127.0.0.1` host file entry for your local machine so that you can access your local machine at that imyourdoc.com URL</li>-->
</ul>

### Install node modules at root of app
```bash
yarn install
```
### Build and run app (from IMYD_FacilityAdmin directory)
```bash
yarnpkg start
```

Debugging Mode
--------------

Use `export REACT_APP_IMYD_DEBUG=true` to enable debugging mode in development.  The global variable `configs.debug` will be set accordingly within the app.

Deployment
----------
Use `REACT_APP_IMYD_ENV=dev|qa|production` in the deployment build step to identify the environment to the build bundle.

```bash
REACT_APP_IMYD_ENV=qa yarn build
```

