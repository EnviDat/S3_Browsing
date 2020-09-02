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

            <v-col class="hidden-xs-only" >
              <span class="ml-4 text-h5">{{ appTitle }}</span>      
            </v-col>

          </v-row>
        </v-col>

        <v-col v-if="loading"
                style="text-align: center;">
          <span class="text-sm-h5 text-subtitle-1">{{ loadingText }}</span>
        </v-col>

        <v-col v-if="!loading && contentBucketName"
                style="text-align: center;">
          <span class="text-sm-h5 text-subtitle-1">Bucket: {{ contentBucketName }}</span>
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
      <v-container class="fill-height" fluid>
        <v-row v-if="loading " >
          <v-col cols="12"
                  sm="3">
            <PlaceholderCard />
          </v-col>

          <v-col cols="12"
                  sm="9">
            <PlaceholderCard />
          </v-col>
        </v-row>

        <v-row v-if="!loading">

          <v-col v-if="content && content.ListBucketResult"
                  cols="12"
                  sm="3">
            <BucketCard :name="content.ListBucketResult.Name"
                        :url="contentURL"
                        :prefix="content.ListBucketResult.Prefix"
                        :maxKeys="content.ListBucketResult.MaxKeys"
                        :delimiter="content.ListBucketResult.Delimiter"
                        :isTruncated="content.ListBucketResult.IsTruncated === 'true' ? true : false"
                        :marker="content.ListBucketResult.Marker" />
          </v-col>

          <v-col cols="12"
                  sm="9" >
            <TreeCard :content="contentMap" />
          </v-col>

        </v-row>
      </v-container>
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
  GET_CONFIG,
  GET_TREE_CONTENT,
} from '@/store/mutationsConsts';

import TreeCard from '@/components/TreeCard';
import IconButton from '@/components/IconButton';
import BucketCard from '@/components/BucketCard';
import PlaceholderCard from '@/components/PlaceholderCard';

import '../node_modules/skeleton-placeholder/dist/bone.min.css';

const configURL = process.env.VUE_APP_CONFIG_URL;

export default {
  name: 'App',
  beforeMount() {
    this.$store.dispatch(GET_CONFIG, configURL);
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
    loading() {
      return this.configLoading || this.contentLoading;
    },
    loadingText() {
      if (this.configLoading) {
        return `Loading config from ${configURL}`;
      } 
      
      if (this.contentLoading) {
        return `Loading S3 Bucket from ${this.contentURL}`;
      }

      return 'Loading should be finished...';
    },
  },
  watch: {
    configLoading() {
      if (!this.configLoading && this.contentURL) {
        this.$store.dispatch(GET_TREE_CONTENT);
      }
    },
  },
  components: {
    TreeCard,
    IconButton,
    BucketCard,
    PlaceholderCard,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
  }),
};
</script>
