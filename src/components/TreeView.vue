<template>
  <v-treeview v-model="tree"
              :items="items"
              :load-children="fetchSubkeys"
              :open.sync="open"
              :search="search"
              item-key="name"
              dense
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
              align="center"
              :class="item.isFile ? 'justify-end' : ''" >

        <v-col class="pl-2 pr-4"
              :class="item.isFile ? '' : 'shrink'">
          {{ item.name }}
        </v-col>

        <v-col v-if="item.isFile"
                class="shrink px-1" >

          <IconButton icon="mdi-content-copy"
                      tooltipText="Copy link to clipboard"
                      @click="catchCopyClick(item.fileUrl)" />
        </v-col>

        <v-col v-if="item.isFile && item.fileExt === 'html'"
                class="shrink px-1" >

          <IconButton icon="mdi-open-in-new"
                      tooltipText="Open file"
                      :url="item.fileUrl" />
        </v-col>

        <v-col v-if="item.isFile && item.fileExt !== 'html'"
                class="shrink px-1" >

          <IconButton icon="mdi-cloud-download"
                      tooltipText="Download file"
                      :url="item.fileUrl" />
        </v-col>

        <v-col v-if="item.isFile"
                class="px-1 caption"
                cols="1" >
          {{ item.size }}
        </v-col>

        <v-col v-if="item.isFile"
                class="px-1 caption"
                cols="2" >
          {{ item.lastModified }}
        </v-col>

        <v-col v-if="!item.isFile && item.childs !== '?'"
                cols="1"
                class="shrink pt-1"  >
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
  computed: {
    ...mapGetters([
      'contentUrl',
      'contentMap',
      'defaultMaxKeys',
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
        'max-keys': this.defaultMaxKeys,
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
      pdf: 'mdi-pdf-box',
      gif: 'mdi-file-image',
      png: 'mdi-file-image',
      ppt: 'mdi-file-powerpoint-box',
      jpeg: 'mdi-file-image',
      jpg: 'mdi-file-image',
      tiff: 'mdi-file-image',
      tif: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
      nc: 'mdi-file',
      r: 'mdi-code-tags',
      c: 'mdi-code-tags',
      cs: 'mdi-code-tags',
      cpp: 'mdi-code-tags',
      tar: 'mdi-zip-box',
      rar: 'mdi-zip-box',
      bz2: 'mdi-zip-box',
      tgz: 'mdi-zip-box',
      zip: 'mdi-zip-box',
    },
  }),
  components: {
    IconButton,
  },
};
</script>
