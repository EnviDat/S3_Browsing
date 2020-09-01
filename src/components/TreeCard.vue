<template>
  <v-card
    class="mx-auto"
    max-width="750" >

    <v-sheet class="pa-4"
            :color="hasContent ? 'blue' : 'error'">

      <v-text-field v-model="search"
                    label="Search Directories"
                    dark
                    flat
                    solo-inverted
                    hide-details
                    clearable  />

      <v-checkbox v-model="caseSensitive"
                  dark
                  hide-details
                  label="Case sensitive search" />
    </v-sheet>

    <v-card-text style="max-height: 75vh; overflow:auto; ">
      <TreeView :items="items"
                :search="search"
                :caseSensitive="caseSensitive" />
    </v-card-text>
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
    components: {
      TreeView,
    },
  };
</script>
