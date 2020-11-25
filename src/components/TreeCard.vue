<template>
  <v-card >
    <v-sheet class="pa-4" color="secondary">

      <v-row no-gutters>
        <v-col>
          <v-text-field v-model="search"
                        label="Search Directories"
                        dark
                        flat
                        solo-inverted
                        hide-details
                        clearable  />
        </v-col>
      </v-row>

      <v-row no-gutters
              align="center"
              justify="end"
              class="pt-2">
        <!-- <v-col >
          <v-checkbox v-model="caseSensitive"
                      style="margin-top: 0px !important"
                      dark
                      dense
                      hide-details
                      label="Case sensitive search" />
        </v-col> -->

        <v-col class="shrink">
          <IconButton icon="mdi-arrow-collapse-vertical"
                      dark
                      tooltipText="Collapse all folders"
                      @click="catchCollapseAll" />
          <!-- <v-btn icon
                  dark
                  @click="catchCollapseAll">
            <v-icon>mdi-arrow-collapse-vertical</v-icon>
          </v-btn> -->
        </v-col>
      </v-row>

    </v-sheet>

    <v-card-text v-if="contentMapValues"
                  :style="`max-height: ${height}; overflow:auto;`">
      <TreeView :items="contentMapValues"
                :search="search"
                :allCollapsed="allCollapsed"
                :fileSelectionEnabled="fileSelectionEnabled"
                @showSnack="catchShowSnack"
                @collapsed="catchCollapsed"
                @selectedFiles="catchSelectedFiles"
                @activeItems="catchActiveItems" />
    </v-card-text>

    <v-sheet v-if="!contentMapValues"
              class="pa-4">

      <v-card-text :style="`background-color: ${$vuetify.theme.themes.light.error};`">
        {{ `No files or folder found for the prefix: ${prefix}` }}
      </v-card-text>

      <v-card-actions>
        <v-btn color="secondary"
                href="/">
          Back to main site
        </v-btn>
      </v-card-actions>
    </v-sheet>

  </v-card>
</template>

<script>
import {
  mapGetters,
} from 'vuex';

import IconButton from './IconButton';
import TreeView from './TreeView';

export default {
  name: 'TreeCard',
  props: {
    height: {
      type: String,
      default: '75vh',
    },
    prefix: String,
    fileSelectionEnabled: Boolean,
  },
  data: () => ({
    caseSensitive: false,
    search: '',
    fullWidth: false,
    allCollapsed: false,
  }),
  computed: {
    ...mapGetters(['contentMap']),
    contentMapValues() {
      return this.contentMap ? Object.values(this.contentMap) : null;
    },    
    // filter() {
    //   return this.caseSensitive
    //     ? (item, search, textKey) => item[textKey].indexOf(search) > -1
    //     : undefined;
    // },
  },
  methods: {
    catchShowSnack(snackMsgObj) {
      this.$emit('showSnack', snackMsgObj);
    },
    catchCollapseAll() {
      this.allCollapsed = true;
    },
    catchCollapsed() {
      this.allCollapsed = false;
    },
    catchSelectedFiles(selectedFiles) {
      this.$emit('selectedFiles', selectedFiles);
    },
    catchActiveItems(activeItems) {
      this.$emit('activeItems', activeItems);
    },
  },
  components: {
    TreeView,
    IconButton,
  },
};
</script>
