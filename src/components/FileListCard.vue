<template>
  <v-card >

    <v-card-title primary-title>
      <v-row no-gutters>
        <v-col>
          {{ title }}
        </v-col>
        <v-col v-show="selectedFiles.length > 0"
                class="shrink"
                cols="2">
          <v-badge color="primary"
                    class="white--text" 
                    :content="selectedFiles.length" />          
        </v-col>
      </v-row>      
    </v-card-title>

    <v-card-text >
      <v-row v-for="(file, index) in selectedFilesPreview"
              :key="`${file.key}_${index}`"
              no-gutters >

        <v-col >
          {{ file.name }}
        </v-col>

      </v-row>

      <v-row v-if="maxSelectedFilesReached"
              no-gutters>
        <v-col>...</v-col>
      </v-row>
    </v-card-text>

    <v-card-text>
      <v-row align="center"
              no-gutters>
        <v-col class="shrink">
          <v-tooltip bottom >

            <template v-slot:activator="{ on, attrs }">
              <v-btn v-on="on"
                      v-bind="attrs"
                      color="secondary"
                      fab
                      small
                      :dark="dark"
                      :download="wgetDownloadInfo.downloadFileName ? wgetDownloadInfo.downloadFileName : null"
                      target="_blank"
                      :href="fileDownloadHref" >

                <img :src="wgetDownloadInfo.image"
                      :style="wgetDownloadInfo.style ? wgetDownloadInfo.style : 'width: 40px; border-radius: 50%;' " />
              </v-btn>          
            </template>
              
            <span>{{ wgetDownloadInfo.title }}</span>

          </v-tooltip>
        </v-col>

        <v-col class="px-2">
          {{ wgetDownloadInfo.title }}
        </v-col>

        <v-col class="shrink">
          <IconButton icon="mdi-information-outline"
                      tooltipText="Show more infos"
                      :color="showDescription ? 'secondary' : ''"
                      @click="clickShowDesc()" />
        </v-col>        
      </v-row>

      <v-row v-show="showDescription"
              align="center"
              class="pt-3"
              no-gutters >

        <v-col cols="12"
                class="pb-2">
          {{ fileSelectionDescription }}
        </v-col>

        <v-col >
          {{ wgetDownloadInfo.description }}
        </v-col>

        <v-col class="shrink">
          <v-btn color="secondary"
                  :dark="dark"
                  text
                  small
                  target="_blank"
                  :href="wgetDownloadInfo.moreInfoUrl" >
            More
            <span class="pl-1">
              <v-icon small>mdi-open-in-new</v-icon>
            </span>
          </v-btn>
        </v-col>

      </v-row>

    </v-card-text>

  </v-card>

</template>

<script>
import IconButton from './IconButton';

export default {
  name: 'FileListCard',
  props: {
    dark: Boolean,
    selectedFiles: {
      type: Array,
      default: () => [],
    },
    fileDownloadHref: String,
    loading: Boolean,
    wgetDownloadInfo: Object,
  },
  data: () => ({
    title: 'Selected files for Wget download',
    fileSelectionDescription: 'If a folder is selected make sure it\'s contains files. Subfolders have to be opened first before a selection is possible. For folder selection use the "Open With Other Protocols" functionalities.',
    showDescription: false,
    maxSelectedFilesPreview: 10,
  }),
  computed: {
    selectedFilesPreview() {
      return this.selectedFiles.slice(0, 10);
    },
    maxSelectedFilesReached() {
      return this.selectedFiles.length > this.maxSelectedFilesPreview;
    },
  },
  methods: {
    clickShowDesc() {
      this.showDescription = !this.showDescription;
    },
    catchFilesDownload() {
      this.$emit('fileDownload');
    },
  },
  components: {
    IconButton,
  },
};
</script>
