<template>
  <v-container fluid>

    <v-row v-if="loading" >
      <v-col cols="12"
              sm="3">
        <PlaceholderCard />
      </v-col>

      <v-col cols="12"
              sm="9">
        <PlaceholderCard />
      </v-col>
    </v-row>

    <v-row v-if="!loading && hasError" >
      <v-col cols="12"
              sm="6" >
        <NotificationCard :title="errorObject.title"
                          :icon="errorObject.icon"
                          :message="errorObject.message" />
      </v-col>
    </v-row>

    <v-row v-if="!loading && !contentError" >

      <v-col v-if="content && content.ListBucketResult"
              cols="12"
              :sm="bucketInfoExpanded ? 3 : ''"
              :class="bucketInfoExpanded ? '' : 'shrink'">

        <BucketCard :expanded="bucketInfoExpanded"
                    :name="content.ListBucketResult.Name"
                    :url="contentUrl"
                    :prefix="content.ListBucketResult.Prefix"
                    :maxKeys="content.ListBucketResult.MaxKeys"
                    :delimiter="content.ListBucketResult.Delimiter"
                    :isTruncated="content.ListBucketResult.IsTruncated === 'true' ? true : false"
                    :marker="content.ListBucketResult.Marker"
                    @expand="catchBucketInfoExpand" />
      </v-col>

      <v-col cols="12"
              sm="9"  >
        <TreeCard :content="contentMap" />
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
import {
  mapState,
  mapGetters,
} from 'vuex';

import {
  GET_CONFIG,
  GET_S3_CONTENT,
} from '@/store/mutationsConsts';

import TreeCard from '@/components/TreeCard';
import BucketCard from '@/components/BucketCard';
import PlaceholderCard from '@/components/PlaceholderCard';
import NotificationCard from '@/components/NotificationCard';

const configURL = process.env.VUE_APP_CONFIG_URL;

export default {
  name: 'Home',
  beforeMount() {
    this.$store.dispatch(GET_CONFIG, configURL);
    
    this.extractUrlParameters();
  },
  computed: {
    ...mapGetters([
      'contentUrl',
      'contentMap',
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
    hasError() {
      return this.configError || this.contentError;
    },
    errorObject() {
      if (this.configError) {
        return {
          title: 'Config Error ',
          message: `Error loading config from ${configURL}`,
        };
      } 
      
      if (this.contentError) {
        return {
          title: 'Bucket Content Error ',
          message: `Error loading S3 Bucket from ${this.contentUrl}`,
        };
      }

      return { }; // return empty object so the defaults will be shown
    },
  },
  watch: {
    configLoading() {
      if (!this.configLoading && this.contentUrl) {
        this.$store.dispatch(GET_S3_CONTENT, { url: this.contentUrl, prefix: this.urlPrefix });
      }
    },
  },
  methods: {
    catchBucketInfoExpand() {
      this.bucketInfoExpanded = !this.bucketInfoExpanded;
    },
    extractUrlParameters() {
      // this.urlPrefix = 'chelsa/chelsa_V1/chelsa_cruts/prec/';
      // return;
      // eslint-disable-next-line no-unreachable
      let params = this.$route.query;

      this.urlPrefix = params?.prefix || null;

      if (!this.urlPrefix) {
        params = this.$route.params;

        this.urlPrefix = params?.prefix || null;
      }
    },
  },
  components: {
    TreeCard,
    BucketCard,
    PlaceholderCard,
    NotificationCard,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
    bucketInfoExpanded: false,
    urlPrefix: null,
  }),
};
</script>
