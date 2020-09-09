<template>

        <v-treeview :items="items"
                    :load-children="fetchSubkeys"
                    :open.sync="open"
                    color="warning" >
                    <!-- :active.sync="active"
                    activatable -->

          <template v-slot:prepend="{ item }">
          <!-- <template v-slot:prepend="{ item, active }"> -->
            <!-- {{ active ? 'active' : 'inactive' }} -->
            <v-icon v-if="item && item.children && item.children.length > 0">mdi-folder</v-icon>
            <v-icon v-if="item && !item.children || item.children.length <= 0">mdi-file</v-icon>
          </template>

        </v-treeview>

  <!-- <v-treeview v-model="tree"
              :active.sync="active"
              :search="search"
              :items="items"
              :load-children="fetchSubkeys"
              item-key="name"
              open-on-click >

    <template v-slot:prepend="{ item, open }" >

      <v-icon v-if="item.file">
        {{ files[item.file] }}
      </v-icon>
        
      <v-icon v-else>
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
    </template>

    <template v-slot:label="{ item }">

      <v-row no-gutters
              align="center">
        <v-col>
          {{ item.name }}
        </v-col>

        <v-col v-if="item.file"
                class="shrink px-1" >

          <IconButton icon="mdi-content-copy"
                      tooltipText="Copy Link"
                      @click="catchCopyClick(item.name)" />
        </v-col>
        <v-col v-if="item.file"
                class="shrink px-1" >

          <IconButton icon="mdi-cloud-download"
                      tooltipText="Download file"
                      :url="item.url" />
        </v-col>

        <v-col v-if="item.file"
                class="shrink px-1 caption" >
          {{ item.size }}
        </v-col>

        <v-col v-if="!item.file"
                cols="1"
                class="shrink"  >
          <v-badge color="primary"
                    class="white--text" 
                    :content="item.childs" />
        </v-col>        

      </v-row>
    </template>

  </v-treeview> -->
</template>

<script>
import {
  mapState,
  mapGetters,
} from 'vuex';

import {
  GET_S3_CONTENT,
} from '@/store/mutationsConsts';

import IconButton from './IconButton';

// const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  name: 'TreeView',
  props: {
    search: String,
    caseSensitive: Boolean,
  },
  beforeMount() {
    this.extractUrlParameters();
  },
  computed: {
    ...mapGetters([
      'contentUrl',
      'contentMap',
    ]),
    ...mapState([
      // 'configLoading',
      // 'configError',
      'content',
      'contentLoading',
      // 'contentError',
    ]),
    values() {
      // return this.contentMap ? this.contentMap.values() : null;
      return this.contentMap ? Object.values(this.contentMap) : null;
    },
    items() {
      // return this.values ? [...this.values] : [];
      return this.values ? this.values : [];
    },
  },
  methods: {
    extractUrlParameters() {
      // this.urlPrefix = 'chelsa/chelsa_V1/chelsa_cruts/prec/';
      // return;
      // eslint-disable-next-line no-unreachable
      let params = this.$route.query;

      this.urlPrefix = params?.prefix || null;

      if (!this.urlPrefix) {
        params = this.$route.params;

        this.urlPrefix = params?.prefix || null;
      }
    },
    filter() {
      return this.caseSensitive
        ? (item, search, textKey) => item[textKey].indexOf(search) > -1
        : undefined;
    },
    catchCopyClick(url) {
      this.copyTextToClipboard(url);
    },
    copyTextToClipboard(text) {
      // if (!navigator.clipboard) {
      //   this.fallbackCopyTextToClipboard(text);
      //   return;
      // }
      navigator.clipboard.writeText(text).then(() => {
        // console.log('Async: Copying to clipboard was successful!');
        this.$emit('showSnack', { text: this.copySnackText, success: true });
      }, (err) => {
        this.$emit('showSnack', { text: err, success: false });
        // console.error('Async: Could not copy text: ', err);
      });
    },
    async fetchSubkeys(item) {
      // console.log(`started fetchSubkeys ${item.directory}`);

      const prefix = item.directory;
      // await pause(1500);
      await this.$store.dispatch(GET_S3_CONTENT, {
        url: this.contentUrl,
        prefix,
      });

      // console.log('finished fetchSubkeys');
    },
  },
  // watch: {
  //   configLoading() {
  //       console.log(`got configLoading ${this.configLoading}`);

  //     if (!this.configLoading && this.contentUrl) {
  //       this.loadS3Content(this.contentUrl, '', '/');
  //     }
  //   },
  // },
  data: () => ({
    copySnackText: 'Url copied to clipboard',
    active: [],
    open: [],
    defaultDelimiter: '/',
    fileExtentions: {
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-json',
      md: 'mdi-markdown',
      pdf: 'file-pdf',
      png: 'mdi-file-image',
      tiff: 'mdi-file-image',
      tif: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
      nc: 'mdi-file',
    },
    tree: [],
  }),
  components: {
    IconButton,
  },
};
</script>
