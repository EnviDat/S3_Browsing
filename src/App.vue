<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <TreeCard class="my-4"
                :content="contentMap" />
    </v-main>
  </v-app>
</template>

<script>
import {
  mapState,
  mapGetters,
} from 'vuex';

import {
  // GET_CONFIG,
  GET_TREE_CONTENT,
} from '@/store/mutationsConsts';

import TreeCard from '@/components/TreeCard';

export default {
  name: 'App',
  beforeMount() {
    // this.$store.dispatch(GET_CONFIG);
    this.$store.dispatch(GET_TREE_CONTENT);
  },
  computed: {
    ...mapGetters([
      'contentURL',
      'contentMap',
      ]),
    ...mapState([
      'configLoading',
      'configError',
      'content',
      'contentLoading',
      'contentError',
    ]),
  },
  components: {
    TreeCard,
  },
  data: () => ({
    //
  }),
};
</script>
