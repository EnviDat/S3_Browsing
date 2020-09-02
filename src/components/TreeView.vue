<template>

  <v-treeview v-model="tree"
              :search="search"
              :items="items"
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

  </v-treeview>
</template>

<script>
import IconButton from './IconButton';

export default {
  name: 'TreeView',
  props: {
    items: Array,
    search: String,
    caseSensitive: Boolean,
  },
  computed: {
  },
  methods: {
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
  },
  data: () => ({
    copySnackText: 'Url copied to clipboard',
    open: [],
    files: {
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
