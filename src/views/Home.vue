<template>
  <v-container fluid>

    <v-row v-if="loading" >
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

    <v-row v-if="!contentError" >

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

      <v-col cols="12"
              sm="9"  >
        <TreeCard @showSnack="catchShowSnack" />
      </v-col>

      <v-col cols="12"
              sm="3" >
        <DownloadToolsCard :tools="downloadTools" />
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

import TreeCard from '@/components/TreeCard';
import DownloadToolsCard from '@/components/DownloadToolsCard';

// import BucketCard from '@/components/BucketCard';
import PlaceholderCard from '@/components/PlaceholderCard';
import NotificationCard from '@/components/NotificationCard';

const configURL = process.env.VUE_APP_CONFIG_URL;

export default {
  name: 'Home',
  beforeMount() {
    this.extractUrlParameters();

    this.$store.dispatch(GET_CONFIG, configURL);

    this.loadImages();    
  },
  computed: {
    ...mapGetters([
      'contentUrl',
      'contentMap',
      ]),
    ...mapState([
      'configLoading',
      'configError',
      'content',
      'contentLoading',
      'contentError',
      'vendorUrl',
    ]),
    loading() {
      // return this.configLoading || this.contentLoading;
      return this.configLoading;
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
    downloadTools() {
      return [
        {
          title: 'Download CyberDuck profile',
          toolTip: 'Use CyberDuck to access the files.',
          image: this.imagesPng('./cyberduck-icon-64.png'),
          href: this.hrefCyberduckFile(),
          downloadFileName: 'envicloud.cyberduck.profile',
          moreInfoUrl: 'https://cyberduck.io/',
        },
        {
          title: 'Browse via Http WebDAV',
          toolTip: 'Use WebDAV to access the files.',
          image: this.imagesPng('./WebDAV.io-logo-55x55.png'),
          href: `http://envicloud.wsl.ch/${this.urlPrefix}`,
          moreInfoUrl: 'https://webdav.io/webdav-client/',
        },
        {
          title: 'Brose via Https WebDAV',
          toolTip: 'Use WebDAV to access the files.',
          image: this.imagesPng('./WebDAV.io-logo-55x55.png'),
          href: `https://envicloud.wsl.ch/webdav/${this.urlPrefix}`,
          moreInfoUrl: 'https://webdav.io/webdav-client/',
        },
        // {
        //   title: 'FTP',
        //   toolTip: 'Use a FTP-Client to access the files.',
        //   image: this.imagesPng('./icons8-ftp-100.png'),
        //   href: null,
        //   clickCallback: () => { console.log('clicked on Cyberduck'); },
        //   moreInfoUrl: 'https://filezilla-project.org/',
        // },
      ];
    },
  },
  watch: {
    configLoading() {
      if (!this.configLoading && this.contentUrl) {
        // initial call
        this.$store.dispatch(GET_S3_CONTENT, { url: this.contentUrl, prefix: this.urlPrefix });
      }
    },
  },
  methods: {
    loadImages() {
      // const getImages = require.context('../assets/', false, /\.png$/);
      this.imagesPng = require.context('../assets/', false, /\.png$/);
      // this.imagesPng = getImages('./' + pet + ".png");
    },
    catchBucketInfoExpand() {
      this.bucketInfoExpanded = !this.bucketInfoExpanded;
    },
    catchShowSnack(snackMsgObj) {
      this.$emit('showSnack', snackMsgObj);
    },
    extractUrlParameters() {
      let params = this.$route.query;

      this.urlPrefix = params?.prefix || '';

      if (!this.urlPrefix) {
        params = this.$route.params;

        this.urlPrefix = params?.prefix || '';
      }
    },
    getCyberduckXML(urlPrefix) {
      return `<?xml version="1.0" encoding="UTF-8"?>
        <plist version="1.0">
          <dict>
            <key>Vendor</key>
            <string>${this.vendorUrl}</string>
            <key>Protocol</key>
            <string>s3</string>
            <key>Default Hostname</key>
            <string>os.zhdk.cloud.switch.ch</string>
            <key>Default Path</key>
            <string>${urlPrefix}</string>
            <key>Anonymous Configurable</key>
            <true/>
          </dict>
        </plist>`;
    },
    hrefCyberduckFile() {
      const prefix = `/envicloud/${this.urlPrefix}`;
      const data = this.getCyberduckXML(prefix);
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
    // BucketCard,
    PlaceholderCard,
    NotificationCard,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
    bucketInfoExpanded: false,
    urlPrefix: null,
    imagesPng: null,
  }),
};
</script>
