<template>
  <v-app>
    <v-app-bar app
                color="secondary"
                dark >

      <v-row no-gutters
              align="center"
              justify="space-between">
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

        <v-col v-if="contentBucketName"
                style="text-align: center;">
          <span class="text-h5">Bucket: {{ contentBucketName }}</span>
        </v-col>

        <v-col >
          <v-row no-gutters justify="end">
            <v-col class="shrink" >

              <IconButton icon="mdi-help-circle"
                          tooltipText="About the S3 Browsing" />

            </v-col>
            <v-col class="shrink" >

              <IconButton icon="mdi-code-tags"
                          tooltipText="Source Code on GitHub"
                          url="https://github.com/EnviDat/S3_Browsing" />
            </v-col>
          </v-row>
        </v-col>

      </v-row>

    </v-app-bar>

    <v-main>
      <TreeCard class="my-4"
                :content="contentMap" />
    </v-main>

    <v-footer>
      <v-spacer></v-spacer>
      <div class="caption" >Developed by the <a href="https://www.envidat.ch/"
          target="_blank" >EnviDat</a> team
      </div>
    </v-footer>
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
import IconButton from '@/components/IconButton';

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
      'contentBucketName',
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
    IconButton,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
  }),
};
</script>
