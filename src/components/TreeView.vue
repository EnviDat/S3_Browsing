<template>

  <v-treeview v-model="tree"
              :search="search"
              :items="items"
              activatable
              item-key="name"
              open-on-click >

    <template v-slot:prepend="{ item, open }">

      <v-icon v-if="!item.file">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
        
      <v-icon v-else>
        {{ files[item.file] }}
      </v-icon>
    </template>

    <!-- <template v-slot:label="{ item }">
      {{ item.name }}
    </template> -->

  </v-treeview>
</template>

<script>
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
    },
    data: () => ({
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
      },
      tree: [],
      // items: [
      //   {
      //     name: '.git',
      //   },
      //   {
      //     name: 'node_modules',
      //   },
      //   {
      //     name: 'public',
      //     children: [
      //       {
      //         name: 'static',
      //         children: [{
      //           name: 'logo.png',
      //           file: 'png',
      //         }],
      //       },
      //       {
      //         name: 'favicon.ico',
      //         file: 'png',
      //       },
      //       {
      //         name: 'index.html',
      //         file: 'html',
      //       },
      //     ],
      //   },
      //   {
      //     name: '.gitignore',
      //     file: 'txt',
      //   },
      //   {
      //     name: 'babel.config.js',
      //     file: 'js',
      //   },
      //   {
      //     name: 'package.json',
      //     file: 'json',
      //   },
      //   {
      //     name: 'README.md',
      //     file: 'md',
      //   },
      //   {
      //     name: 'vue.config.js',
      //     file: 'js',
      //   },
      //   {
      //     name: 'yarn.lock',
      //     file: 'txt',
      //   },
      // ],
    }),
  };
</script>
