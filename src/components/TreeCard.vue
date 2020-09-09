<template>
  <v-card height="100%">
    <v-sheet class="pa-4" color="primary">

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
              class="pt-2">
        <v-col >
          <v-checkbox v-model="caseSensitive"
                      style="margin-top: 0px !important"
                      dark
                      dense
                      hide-details
                      label="Case sensitive search" />
        </v-col>

      </v-row>

    </v-sheet>

    <v-card-text :style="`max-height: ${height}; overflow:auto;`">
      <TreeView :search="search"
                :caseSensitive="caseSensitive"
                @showSnack="catchShowSnack" />
    </v-card-text>

  </v-card>
</template>

<script>

import TreeView from './TreeView';

export default {
  name: 'TreeCard',
  props: {
    height: {
      type: String,
      default: '75vh',
    },
  },
  data: () => ({
    caseSensitive: false,
    search: '',
    fullWidth: false,
  }),
  computed: {
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
  },
  components: {
    TreeView,
  },
};
</script>
