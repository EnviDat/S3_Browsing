[![Codacy Badge](https://app.codacy.com/project/badge/Grade/07867b83bc9244c8ada67e5f7df03ac4)](https://www.codacy.com/gh/EnviDat/S3_Browsing/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=EnviDat/S3_Browsing&amp;utm_campaign=Badge_Grade)
[![DeepScan grade](https://deepscan.io/api/teams/6114/projects/13957/branches/248737/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=6114&pid=13957&bid=248737)

# S3 Browsing Web Frontend

Web file browser for a S3 backend. Browse and download files in a 
file tree structure.

## Features

- Search directories and files
- The content of folders is "lazy-loaded" to prevent a long initial rendering time
- prefix query parameter to start from a certain folder
- It works **only for public S3 Buckets** (by version 1.2.0)


Check https://envicloud.wsl.ch/ as a demo.
See the prefix parameter in action: https://envicloud.wsl.ch/#/?prefix=slf/


## Install

After cloning use

    npm install

to install all depencenies.

To develope use `npm run serve`
To create a build use `npm run build` or `npm run build --modern`

**However before you develop or create a build, you have to configure
the different urls to point to your backend.**

## Local development
However you make the config, depending on your server you might still get CORS Network Error for backend calls. Since default server setups usually don't allow the any origin.

To still be able to test locally your can run [chrome with disabled web security](https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome)


## Configuration

There are two ways to you can adjust the configurations
of this app. With a config.json as the main 

Either change the VUE_APP_\* variables in the .env.development and .env.production files. These are the "fallback variables" when the config.json
can't be loaded from the backend.

The simplest setup is to change these variables, however for any changes of them
you have to re-build to frontend and re-deploy it. To avoid that just set the VUE_APP_CONFIG_URL to point to a json file on the server side which includes the configs.

### Minimal configs

#### Minimal .env.production config for the contentUrl

Two ways to setup, either only use the VUE_APP_\* variables to
set the contentUrl to load the S3 Content to browse through, like this:

      VUE_APP_CONTENT_URL=http://www.domain.something/possibleSubdomain/

Or you load all the configs from your backend to still have the flexiblity to
define configurations on the server side.

#### Minimal .env.production for server side configuration

      VUE_APP_CONFIG_URL=http://www.domain.something/possibleSubdomain/config.json

Which loads the config.json from the given url.
This file would need to have at least the contentUrl defined, like so:

#### Minimal config.json file for the content to load

    {
      "contentUrl": "http://www.domain.something/possibleSubdomain/"
    }


#### Minimal .env.development config.json file

For this setup to work the public folder in the root folder of this projects
needs a 'testdata' folder with the config.json file in it.

      VUE_APP_CONFIG_URL=./testdata/config.json

### Extensive configs and options

Here are exmaples for the full definition either in the .env files or in the config.json.

Aside from the contentUrl the other options are mostly relevant for the "Other Protocols" Card and are only going to take effect when the `VUE_APP_SHOW_PROTOCOLS` or `showProtocols` is set to `true`


#### Example a full .env.development / .env.production config only

      VUE_APP_USE_TESTDATA=false
      VUE_APP_CONTENT_URL=https://envicloud.wsl.ch/envicloud/
      VUE_APP_DOWNLOAD_DOMAIN=https://os.zhdk.cloud.switch.ch/envicloud/
      VUE_APP_DEFAULT_MAX_KEYS=1000
      VUE_APP_SHOW_PROTOCOLS=true
      VUE_APP_VENDOR_URL=www.envidat.ch
      VUE_APP_CYBERDUCK_HOST_NAME=os.zhdk.cloud.switch.ch
      VUE_APP_CYBERDUCK_PROFILE_NAME=envicloud.cyberduck.profile
      VUE_APP_WEBDAV_DOMAIN_HTTP=http://envicloud.wsl.ch/
      VUE_APP_WEBDAV_DOMAIN_HTTPS=https://envicloud.wsl.ch/webdav/


For more information about [how the .env files work check the dotenv package](https://www.npmjs.com/package/dotenv)

#### About the VUE_APP_USE_TESTDATA variable

This is mainly used to really test locally with test files the in the public folder of the project. It might be changed and isn't garantied to working properly.
Better go for the local development option via chrome.

#### Example Config.json

    {
      "showProtocols": true,
      "defaultMaxKeys": 10000,
      "contentUrl": "https://envicloud.wsl.ch/envicloud/",
      "downloadDomain": "https://os.zhdk.cloud.switch.ch/envicloud/",
      "vendorUrl": "www.envidat.ch",
      "cyberduckHostName": "os.zhdk.cloud.switch.ch",
      "cyberduckProfileName": "envicloud",
      "webDAVDomainHttp": "http://envicloud.wsl.ch/",
      "webDAVDomainHttps": "https://envicloud.wsl.ch/webdav/"
    }

#### Example of the .cyberduckprofile xml

This is only relevant is the `showProtocols` options is `true`.
Here is the xml of the cyberduckprofile which can be downloaded from the "Other Protocols" Card. As you can see the are some variables used, which have to be defined
via .env files or json-config.

      `<?xml version="1.0" encoding="UTF-8"?>
        <plist version="1.0">
          <dict>
            <key>Vendor</key>
            <string>${this.vendorUrl}</string>
            <key>Protocol</key>
            <string>s3</string>
            <key>Default Nickname</key>
            <string>${this.contentBucketName} - S3 Bucket</string>
            <key>Default Hostname</key>
            <string>${this.cyberduckHostName}</string>
            <key>Default Path</key>
            <string>${urlPrefix}</string>
            <key>Anonymous Configurable</key>
            <true/>
          </dict>
        </plist>`;

The `contentBucketName` comes from the S3 xml which is provided via `contentUrl`.
The `urlPrefix` is a query parameter from the url

[More about Cyberduck ](https://www.cyberduck.io/)


### Configuration Options

| Option | Usage | Type | Required |
| ------ | ----- | ----- | ----- |
| contentUrl | The backend end point from where the S3 XML is served. | String | True |
| downloadDomain | The downloadDomain is used for the url of a file in case of download and copy the link. It falls back to the `contentUrl` if not filled.  | String | Optional |
| defaultMaxKeys | Is used as the max-keys parameter for the S3 request. Might be needed when making a pagination. Defaults to `10000`. | String | Optional |
| showProtocols | If `true` the "Other Protocols" Card will be shown. | String | Optional |
| vendorUrl | This is the institution or company which provides the cyberduck profile.  | String | Optional, needs `showProtocols` to be `true` |
| cyberduckHostName | The main domain for the cyberduck connection. Should include no subdomains.  | String | Optional, needs `showProtocols` to be `true` |
| cyberduckProfileName | The name of the downloaded file. It will be [cyberduckProfileName].cyberduckprofile . | String | Optional, needs `showProtocols` to be `true` |
| webDAVDomainHttp | The webDAV http url for browsing via webDAV.  | String | Optional, needs `showProtocols` to be `true` |
| webDAVDomainHttps | The webDAV https url for browsing via webDAV.  | String | Optional, needs `showProtocols` to be `true` |


Here you get further information about the [cyberduck profile xml](https://trac.cyberduck.io/wiki/help/en/howto/profiles)

## Testing

Use 

    npm run test:unit

for running the unit tests.
For now only the s3Factory methods are being tested.


## Know Issues

- Rendering large amounts of folder and files is still pretty slow. For the https://envicloud.wsl.ch we are having folders which have >1k or even >4k files which makes the rendering from the v-tree-view component of vuetify very slow. To handle such large amounts of entries a virtual list is needed, which will probably be implemented in the future.
- Bulk downloading files, for downloading mutliple files at once you need to use a different protocol / client, make sure to enable the `showProtocols` option.
- Multiple entires >10k as mentioned the rendering isn't performant, so this issue isn't tackled yet, but if for any folder there are more than 10k entires the needs to be a pagniation of sorts or at least multiple requests to the backend. The default server side maximum seems to be 10k, this might be configurable, so how. For a multiple request scenario the `Marker` parameter can be used make any futher calls. The `Marker` would be the last key which was provided from the last request and from there the new request should provide again the amount given with the max-keys parameter or the server side maxium. (As of version 1.2.0 such a scenario isn't implemented yet.)

