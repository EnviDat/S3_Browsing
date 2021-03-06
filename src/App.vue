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
            <v-col class="shrink"
                    style="cursor: pointer;"
                    @click="navigateTo('/')" >
                <v-img :src="this.imagesPng('./S3-Logo.png')" />
            </v-col>

            <v-col class="hidden-xs-only ml-4"
                    style="cursor: pointer;"
                    @click="navigateTo('/')" >
              <v-row no-gutters>
                <v-col class="text-h5">{{ appTitle }}</v-col>      
              </v-row>
              <v-row no-gutters>
                <v-col style="line-height: 0.5rem; font-size: 0.5rem !important;" class="text-body-2">{{ version }}</v-col>
              </v-row>
            </v-col>

          </v-row>
        </v-col>

        <v-col v-if="loading"
                style="text-align: center;">
          <span class="text-sm-body-1 text-body-2">{{ loadingText }}</span>
        </v-col>

        <v-col v-if="!loading && contentBucketName"
                style="text-align: center;">
          <span class="text-sm-body-1 text-body-2">Bucket: {{ contentBucketName }}</span>
        </v-col>

        <v-col >
          <v-row no-gutters justify="end">
            <v-col class="shrink" >

              <IconButton icon="mdi-help-circle"
                          tooltipText="About the S3 Browser"
                          :clickCallback="() => { navigateTo('About'); }" />

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
      <router-view @showSnack="catchShowSnack" />
      
    </v-main>

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

import IconButton from '@/components/IconButton';

import '../node_modules/skeleton-placeholder/dist/bone.min.css';

const configURL = process.env.VUE_APP_CONFIG_URL;

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'contentUrl',
      'contentBucketName',
      ]),
    ...mapState([
      'configLoading',
      'contentLoading',
      'imagesPng',
    ]),
    loading() {
      return this.configLoading || this.contentLoading;
    },
    loadingText() {
      if (this.configLoading) {
        return `Loading config from ${configURL}`;
      } 
      
      if (this.contentLoading) {
        return `Loading S3 Bucket from ${this.contentUrl}`;
      }

      return 'Loading should be finished...';
    },
  },
  methods: {
    navigateTo(routeName) {
      if (this.$route.name === routeName || this.$route.path === routeName) {
        return;
      }

      this.$router.push(routeName);
    },
    catchShowSnack(snackMsgObj) {
      this.snackbar = true;
      this.snackText = snackMsgObj.text;
      this.snackColor = snackMsgObj.success ? 'success' : 'error';
    },
  },
  components: {
    IconButton,
  },
  data: () => ({
    appTitle: 'File Browser',
    appAvatarText: 'S3',
    snackbar: false,
    snackText: '',
    snackColor: 'success',
    timeout: 2500,
    version: process.env.VUE_APP_VERSION,
  }),
};
</script>
