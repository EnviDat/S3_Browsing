<template>
  <v-container fluid>

    <v-row v-if="configLoading" >
      <v-col cols="12"
              sm="3">
        <PlaceholderCard />
      </v-col>

      <v-col cols="12"
              sm="9">
        <PlaceholderCard />
      </v-col>
    </v-row>

    <v-row v-if="!loading && hasError" >
      <v-col cols="12"
              sm="6" >
        <NotificationCard :title="errorObject.title"
                          :icon="errorObject.icon"
                          :message="errorObject.message" />
      </v-col>
    </v-row>

    <v-row >

      <!-- <v-col cols="12"
              :sm="bucketInfoExpanded ? 3 : ''"
              :class="bucketInfoExpanded ? '' : 'shrink'">

        <BucketCard :expanded="bucketInfoExpanded"
                    :name="content.ListBucketResult.Name"
                    :url="contentUrl"
                    :prefix="content.ListBucketResult.Prefix"
                    :maxKeys="content.ListBucketResult.MaxKeys"
                    :delimiter="content.ListBucketResult.Delimiter"
                    :isTruncated="content.ListBucketResult.IsTruncated === 'true' ? true : false"
                    :marker="content.ListBucketResult.Marker"
                    :loading="loading || !(content && content.ListBucketResult)"
                    @expand="catchBucketInfoExpand" />
      </v-col> -->

      <v-col v-if="!configLoading && !contentError" 
              cols="12"
              :sm="showProtocols ? 9 : 12" >
        <TreeCard :fileSelectionEnabled="fileSelectionEnabled"
                  :prefix="urlPrefix" 
                  @showSnack="catchShowSnack"
                  @selectedFiles="catchSelectedFiles"
                  @activeItems="catchActiveItems"/>
      </v-col>

      <v-col cols="12"
              sm="3">
        <v-row no-gutters>
          <v-col v-if="showProtocols"
                  cols="12"
                  class="pb-4" >
            <DownloadToolsCard :tools="downloadTools"
                                :loading="loading"
                                :highlightTitle="!!selectedFolder"
                                :selectedFolder="selectedFolder ? selectedFolder : urlPrefix" />
          </v-col>

          <v-col v-if="fileSelectionEnabled" 
                  cols="12">
            <FileListCard :selectedFiles="selectedFiles"
                          :loading="loading"
                          :wgetDownloadInfo="wgetDownloadInfo"
                          :fileDownloadHref="hrefWgetFile()" />
          </v-col>
        </v-row>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
import {
  mapState,
  mapGetters,
} from 'vuex';

import {
  GET_CONFIG,
  GET_S3_CONTENT,
} from '@/store/mutationsConsts';

import { sanitaizePrefix } from '@/store/s3Factory';

import TreeCard from '@/components/TreeCard';
import DownloadToolsCard from '@/components/DownloadToolsCard';
import FileListCard from '@/components/FileListCard';

// import BucketCard from '@/components/BucketCard';
import PlaceholderCard from '@/components/PlaceholderCard';
import NotificationCard from '@/components/NotificationCard';

const configURL = process.env.VUE_APP_CONFIG_URL;

export default {
  name: 'Home',
  beforeMount() {
    this.extractUrlParameters();

    if (configURL) {
      // the loadContent() get triggered from the watcher on configLoading
      // after the config is loaded the content with the new config will be loaded
      this.$store.dispatch(GET_CONFIG, configURL);
    } else {
      this.loadContent();
      this.setDownloadTools();
    }
  },
  computed: {
    ...mapGetters([
      'contentBucketName',
      'contentMap',
      'contentUrl',
      'downloadDomain',
      'showProtocols',
      'fileSelectionEnabled',
      'vendorUrl',
      'cyberduckHostName',
      'cyberduckProfileName',
      'WebDAVDomainHttp',
      'WebDAVDomainHttps',
      'wgetDomain',
      'ftpDomain',
      ]),
    ...mapState([
      'configLoading',
      'configError',
      'content',
      'contentLoading',
      'contentError',
      'imagesPng',
    ]),
    loading() {
      return this.configLoading || this.contentLoading;
      // return this.configLoading;
    },
    hasError() {
      return this.configError || this.contentError;
    },
    errorObject() {
      if (this.configError) {
        return {
          title: 'Config Error ',
          message: `Error loading config from ${configURL}. ${this.configError}`,
        };
      } 
      
      if (this.contentError) {
        return {
          title: 'Bucket Content Error ',
          message: `Error loading S3 Bucket from ${this.contentUrl}. ${this.contentError} ${this.contentError.stack}`,
        };
      }

      return { }; // return empty object so the defaults will be shown
    },
    selectedFolder() {
      if (this.activeFolders?.length <= 0) {
        return null;
      }

      return this.activeFolders[0].directory;
    },
  },
  watch: {
    configLoading() {
      if (!this.configLoading && this.contentUrl) {
        this.loadContent();
        this.setDownloadTools();
      }
    },
  },
  methods: {
    loadContent() {
      this.$store.dispatch(GET_S3_CONTENT, { url: this.contentUrl, prefix: this.urlPrefix });
    },
    setDownloadTools() {
      // not done via computedProperty because the DownloadToolCard can change the showDescription
      // via computed that isn't working
      const prefix = this.selectedFolder ? this.selectedFolder : this.urlPrefix;
      const tools = [];

      if (this.cyberduckProfileName && this.cyberduckHostName && this.vendorUrl) {
        tools.push({
          title: 'Download Cyberduck bookmark',
          toolTip: 'Download a Cyberduck bookmark to access the files via the Cyberduck client.',
          image: this.imagesPng('./cyberduck-icon-64.png'),
          href: this.hrefCyberduckFile(prefix),
          downloadFileName: `${this.cyberduckProfileName}.cyberduckprofile`,
          moreInfoUrl: 'https://cyberduck.io/',
          showDescription: false,
          description: 'Access the files in the S3 Bucket via Cyberduck client.',
        });
      }

      if (this.WebDAVDomainHttp) {
        tools.push({
          title: 'Browse via Http WebDAV',
          toolTip: 'Open a new tab to access the files via WebDAV.',
          image: this.imagesPng('./dav-100-2.png'),
          href: `${this.WebDAVDomainHttp}${prefix}`,
          moreInfoUrl: 'https://webdav.io/webdav-client/',
          showDescription: false,
          description: 'Access the files in the S3 Bucket via the WebDAV protocol over HTTP.',
        });
      }

      if (this.WebDAVDomainHttps) {
        tools.push({
          title: 'Browse via Https WebDAV',
          toolTip: 'Use WebDAV to access the files.',
          image: this.imagesPng('./dav-100-2.png'),
          href: `${this.WebDAVDomainHttps}${prefix}`,
          moreInfoUrl: 'https://webdav.io/webdav-client/',
          showDescription: false,
          description: 'Access the files in the S3 Bucket via the WebDAV protocol over HTTP(S).',
        });
      }

      this.wgetDownloadInfo.image = this.imagesPng('./wget-2.png');
      this.wgetDownloadInfo.href = `${this.wgetDomain}?prefix=${prefix}`;
      this.wgetDownloadInfo.filesDownloadHref = this.hrefWgetFile(this.selectedFiles);

      if (this.wgetDomain) {
        tools.push(this.wgetDownloadInfo);
      }

      if (this.ftpDomain) {
        tools.push({
          title: 'Download files via FTP',
          toolTip: 'Use FTP to access the files.',
          image: this.imagesPng('./ftp-2.png'),
          href: `${this.ftpDomain}${prefix}`,
          moreInfoUrl: 'https://filezilla-project.org/',
          showDescription: false,
          style: 'width: 38px; border-radius: 10%;',
          description: 'Use any ftp client to download the files.',
        });
      }

        // {
        //   title: 'FTP',
        //   toolTip: 'Use a FTP-Client to access the files.',
        //   image: this.imagesPng('./icons8-ftp-100.png'),
        //   href: null,
        //   clickCallback: () => { console.log('clicked on Cyberduck'); },
        //   moreInfoUrl: 'https://filezilla-project.org/',
        // },

      this.downloadTools = tools;
    },
    clickShowDesc(tool) {
      tool.showDescription = !tool.showDescription;
    },
    catchBucketInfoExpand() {
      this.bucketInfoExpanded = !this.bucketInfoExpanded;
    },
    catchShowSnack(snackMsgObj) {
      this.$emit('showSnack', snackMsgObj);
    },
    catchSelectedFiles(selectedFiles) {
      this.selectedFiles = selectedFiles;
    },
    catchActiveItems(activeItems) {
      this.activeFolders = activeItems;
      this.setDownloadTools();
    },
    extractUrlParameters() {
      let params = this.$route.query;

      let prefix = params?.prefix || '';

      if (!prefix) {
        params = this.$route.params;
        prefix = params?.prefix || '';
      }

      this.urlPrefix = sanitaizePrefix(prefix);
    },
    getCyberduckXML(urlPrefix) {
      return `<?xml version="1.0" encoding="UTF-8"?>
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
    },
    hrefCyberduckFile(urlPrefix) {
      const prefix = `/envicloud/${urlPrefix}`;
      const data = this.getCyberduckXML(prefix);
      // const encodedData = encodeURI(data);
      const encodedData = btoa(unescape(encodeURIComponent(data)));

    // return `data:text/plain;charset=UTF-8;page=21,${encodedData};`;
      return `data:application/octet-stream;charset=UTF-8;base64,${encodedData}`;
    },
    getWgetListfile(selectedFiles) {
      let fileString = '';

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        fileString += `${file.fileUrl} \n`;
      }

      return fileString;
    },
    hrefWgetFile() {
      if (this.selectedFiles.length <= 0) {
        return '';
      }

      const data = this.getWgetListfile(this.selectedFiles);
      // const encodedData = encodeURI(data);
      const encodedData = btoa(unescape(encodeURIComponent(data)));

    // return `data:text/plain;charset=UTF-8;page=21,${encodedData};`;
      return `data:application/octet-stream;charset=UTF-8;base64,${encodedData}`;
    },
    saveDirectoyViaMemoryFile() {
      // const data = { name: item.name }; // need to get the data via directory?
      // const fileName = item.name.split('/').reverse()[1];
      const prefix = `/envicloud/${this.urlPrefix}`;
      const data = this.getCyberduckXML(prefix);
      let fileName = this.contentUrl.split('.')[0];
      fileName = fileName.replace('http://', '');
      fileName = fileName.replace('https://', '');
      fileName = `${fileName}.cyberduck.profile`;

      const blob = new Blob([data], {
        type: 'text/plain',
      });

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        const el = window.document.createElement(fileName);
        el.href = window.URL.createObjectURL(blob);        
        // const url = el.href;

        el.download = fileName;
        el.click();

        // window.document.body.removeChild(fileName);
        // window.URL.revokeObjectURL(url);
      }
    },
  },
  components: {
    TreeCard,
    DownloadToolsCard,
    FileListCard,
    PlaceholderCard,
    NotificationCard,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
    bucketInfoExpanded: false,
    urlPrefix: null,
    downloadTools: null,
    selectedFiles: [],
    activeFolders: [],
    wgetDownloadInfo: {
      title: 'Download files via Wget command',
      toolTip: 'Download files paths to use via Wget command',
      moreInfoUrl: 'https://www.gnu.org/software/wget/',
      downloadFileName: 'envidatS3paths.txt',
      showDescription: false,
      style: 'width: 38px; border-radius: 10%;',
      description: 'Download the file (envidatS3paths.txt), install wget and then run the command: wget --no-host-directories --force-directories --input-file=envidatS3paths.txt.',
    },
  }),
};
</script>
