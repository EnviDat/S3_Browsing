<template>
  <v-app>
    <v-app-bar app
                color="secondary"
                dark >

      <v-row no-gutters
              align="center">
        <v-col>

          <v-row no-gutters
              align="center" >
            <v-col class="shrink">
                <v-avatar color="red"
                          class="text-h5">
                  {{ appAvatarText }}
                </v-avatar>
            </v-col>

            <v-col >
              <span class="ml-4 text-h5">{{ appTitle }}</span>          
            </v-col>

          </v-row>
        </v-col>

        <v-spacer></v-spacer>

        <v-col class="shrink" >
          <v-btn icon >
            <v-icon>mdi-help-circle</v-icon>
          </v-btn>
        </v-col>

      </v-row>

      <!-- <div class="d-flex align-center">

      </div> -->

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
    appTitle: 'File Browser',
    appAvatarText: 'S3',
  }),
};
</script>
