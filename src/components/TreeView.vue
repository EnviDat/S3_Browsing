<template>
  <v-treeview v-model="tree"
              :items="items"
              :load-children="fetchSubkeys"
              :open.sync="open"
              :search="search"
              item-key="name"
              expand-icon="mdi-chevron-down"
              open-on-click >

    <template v-slot:prepend="{ item, open }" >

      <v-icon v-if="item.isFile">
        {{ fileExtentions[item.fileExt] }}
      </v-icon>
        
      <v-icon v-else>
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
    </template>

    <template v-slot:label="{ item }">

      <v-row no-gutters
              align="center">

        <v-col class="pl-2 pr-4 shrink">
          {{ item.name }}
        </v-col>

        <v-col v-if="item.isFile"
                class="shrink px-1" >

          <IconButton icon="mdi-content-copy"
                      tooltipText="Copy Link"
                      @click="catchCopyClick(item.fileUrl)" />
        </v-col>

        <v-col v-if="item.isFile"
                class="shrink px-1" >

          <IconButton icon="mdi-cloud-download"
                      tooltipText="Download file"
                      :url="item.fileUrl" />
        </v-col>

        <v-col v-if="item.isFile"
                class="shrink px-1 caption" >
          {{ item.size }}
        </v-col>

        <v-col v-if="!item.isFile"
                cols="1"
                class="shrink"  >
          <v-badge color="primary"
                    class="white--text" 
                    :content="item.childs" />
        </v-col>        

      </v-row>
    </template>

  </v-treeview>
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

export default {
  name: 'TreeView',
  props: {
    search: String,
    caseSensitive: Boolean,
    allCollapsed: Boolean,
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
      'content',
      'contentLoading',
    ]),
    items() {
      return this.values ? this.values : [];
    },
    values() {
      // return this.contentMap ? this.contentMap.values() : null;
      return this.contentMap ? Object.values(this.contentMap) : null;
    },
  },
  methods: {
    extractUrlParameters() {
      let params = this.$route.query;

      this.urlPrefix = params?.prefix || null;

      if (!this.urlPrefix) {
        params = this.$route.params;

        this.urlPrefix = params?.prefix || null;
      }
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
      // console.log({ item });

      if (item.isFile) {
        return;
      }

      const prefix = item.directory;

      await this.$store.dispatch(GET_S3_CONTENT, {
        url: this.contentUrl,
        prefix,
      });

      item.open = true;
    },
  },
  watch: {
    allCollapsed() {
      if (this.allCollapsed) {
        this.open = [];
        this.$emit('collapsed');
      }
    },
  },
  data: () => ({
    tree: [],
    copySnackText: 'Url copied to clipboard',
    active: [],
    open: [],
    fileExtentions: {
      csv: 'mdi-text-box',
      doc: 'mdi-file-word-box',
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-json',
      md: 'mdi-markdown',
      pdf: 'file-pdf',
      png: 'mdi-file-image',
      ppt: 'mdi-file-powerpoint-box',
      jpeg: 'mdi-file-image',
      jpg: 'mdi-file-image',
      tiff: 'mdi-file-image',
      tif: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
      nc: 'mdi-file',
      zip: 'mdi-zip-box',
    },
  }),
  components: {
    IconButton,
  },
};
</script>
