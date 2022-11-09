<template>
  <v-container fluid>
    <v-row>
      <v-col v-show="aboutLoading" class="pt-5" cols="12">
        Loading about information...
      </v-col>

      <v-col v-if="!aboutLoading" cols="12" class="pt-5" v-html="aboutText">
      </v-col>

      <v-col v-if="!aboutLoading && aboutError" cols="12" class="pt-5">
        <NotificationCard title="About Not Loaded!" :message="errorText" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';

import { GET_ABOUT } from '@/store/mutationsConsts';

import remark from 'remark';
import html from 'remark-html';

const aboutURL = process.env.VUE_APP_ABOUT_URL;

export default {
  name: 'About',
  beforeMount() {
    if (aboutURL) {
      this.loadAbout();
    }
  },
  methods: {
    loadAbout() {
      this.$store.dispatch(GET_ABOUT, aboutURL);
    },
  },
  computed: {
    ...mapState(['about', 'aboutLoading', 'aboutError']),
    aboutMarkdown() {
      return this.about || this.defaultAbout;
    },
    errorText() {
      return `${this.aboutError}. If this error is consistent please report in on the Github page of the project.`;
    },
    aboutText() {
      return remark().use(html).processSync(this.aboutMarkdown).toString();
    },
  },
  data: () => ({
    defaultAbout: `
# About the S3 Browsing Web Frontend

This app is a web file browser for a S3 backend. You can browse and download files in a 
file tree structure.

If you aren't on [https://envicloud.wsl.ch/](https://envicloud.wsl.ch/) then, what you are seeing
here is the default About info from https://envicloud.wsl.ch/.

The developers of the webiste you're currently on should have replaced it,
but didn't.

<br />

## Features of S3 Web Frontend
  - Search directories and files
  - The content of folders is "lazy-loaded" to prevent a long initial rendering time
  - prefix query parameter to start from a certain folder
  - It works **only for public S3 Buckets** (by version 1.2.x)

<br />

## Contact

The S3 Browsing Web Frontend is developed by the team behind [EnviDat](https://www.envidat.ch).

If it's about this frontend you can directly contact [Dominik Haas-Artho](https://github.com/DomDomHaas)
`,
  }),
};
</script>
