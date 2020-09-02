<template>
  <v-card style="transition: .3s all;"
          :class="fullWidth ? 'mx-4' : 'mx-auto'"
          :max-width="fullWidth ? '100%' : 700" >

    <v-sheet class="pa-4"
            :color="hasContent ? 'blue' : 'error'">

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

        <v-col class="shrink">
          <v-btn v-model="fullWidth"
                      dark
                      icon
                      @click="fullWidth = !fullWidth" >
            <v-icon>{{ fullWidth ? 'mdi-arrow-collapse-horizontal' : 'mdi-arrow-expand-horizontal' }}</v-icon>
          </v-btn>
        </v-col>
      </v-row>

    </v-sheet>

    <v-card-text style="max-height: 75vh; overflow:auto; ">
      <TreeView :items="items"
                :search="search"
                :caseSensitive="caseSensitive"
                @showSnack="catchShowSnack" />
    </v-card-text>

    <v-snackbar v-model="snackbar"
                :timeout="timeout"
                top
                right
                :color="snackColor"
                elevation="5" >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="white"
                icon
                v-bind="attrs"
                @click="snackbar = false" >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

  </v-card>
</template>

<script>
import TreeView from './TreeView';

export default {
  name: 'TreeCard',
  props: {
    content: Map,
  },
  data: () => ({
    caseSensitive: false,
    search: '',
    snackbar: false,
    snackText: '',
    snackColor: 'success',
    timeout: 2500,
    fullWidth: false,
  }),
  computed: {
    hasContent() {
      return this.content && this.content.size > 0;
    },
    values() {
      return this.hasContent ? this.content.values() : null;
    },
    items() {
      return this.values ? [...this.values] : [];
    },
    // filter() {
    //   return this.caseSensitive
    //     ? (item, search, textKey) => item[textKey].indexOf(search) > -1
    //     : undefined;
    // },
  },
  methods: {
    catchShowSnack(snackMsgObj) {
      this.snackbar = true;
      this.snackText = snackMsgObj.text;
      this.snackColor = snackMsgObj.success ? 'success' : 'error';
    },
  },
  components: {
    TreeView,
  },
};
</script>
