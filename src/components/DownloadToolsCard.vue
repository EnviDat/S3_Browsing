<template>
  <v-card :loading="loading" >

    <v-card-title primary-title
                  :style="`background-color:${highlightTitle ? $vuetify.theme.themes.light.secondary : ''};
                  transition: 0.5s all; line-height: 1.6rem;`" >
      {{ `Entire Directory Download of "${selectedFolder ? selectedFolder : 'root'}"` }}
    </v-card-title>

    <v-card-text class="pt-2">

      <v-row v-for="(tool, index) in tools"
              :key="`${tool.title}_${index}`"
              no-gutters >

        <v-row align="center"
                class="py-1"
                no-gutters >
          
          <v-col class="shrink">
            <!-- <v-tooltip bottom >

              <template v-slot:activator="{ on, attrs }">
                <v-btn v-on="on"
                        v-bind="attrs"
                        color="secondary"
                        fab
                        small
                        :dark="dark"
                        :href="tool.href ? tool.href : ''"
                        :download="tool.downloadFileName ? tool.downloadFileName : null"
                        target="_blank"
                        @click="!tool.href && tool.clickCallback ? tool.clickCallback() : $emit('click');"> -->

                  <!-- <v-img :src="tool.image" height="32" width="32" /> -->
                  <img :src="tool.image"
                        :style="tool.style ? tool.style : 'width: 40px; border-radius: 50%; '" />
                <!-- </v-btn>
              </template>
                
              <span>{{ tool.toolTip }}</span>

            </v-tooltip> -->
          </v-col>

          <v-col class="px-2">
            {{ tool.title }}
          </v-col>

          <v-col class="shrink mx-2" 
                        :style="`border-radius: 50%; border: solid 1px ${$vuetify.theme.themes.light.secondary};`">
            <v-tooltip bottom >

              <template v-slot:activator="{ on, attrs }">
                <v-btn v-on="on"
                        v-bind="attrs"
                        color="secondary"
                        icon
                        small
                        :dark="dark"
                        :href="tool.href ? tool.href : ''"
                        :download="tool.downloadFileName ? tool.downloadFileName : null"
                        target="_blank"
                        @click="!tool.href && tool.clickCallback ? tool.clickCallback() : $emit('click');">

                  <v-icon>mdi-file-download</v-icon>
                </v-btn>
              </template>
                
              <span>{{ tool.toolTip }}</span>

            </v-tooltip>
          </v-col>

          <v-col class="shrink">
            <IconButton icon="mdi-information-outline"
                        tooltipText="Show more infos"
                        :color="tool.showDescription ? 'secondary' : ''"
                        @click="clickShowDesc(tool)" />
          </v-col>
        </v-row>

        <v-row v-show="tool.showDescription"
                align="center"
                class="pt-1 pb-2"
                no-gutters >

          <v-col >
            {{ tool.description }}
          </v-col>

          <v-col class="shrink">
            <v-btn color="secondary"
                    :dark="dark"
                    text
                    small
                    target="_blank"
                    :href="tool.moreInfoUrl" >
              More
              <span class="pl-1">
                <v-icon small>mdi-open-in-new</v-icon>
              </span>
            </v-btn>
          </v-col>
        </v-row>

      </v-row>

    </v-card-text>

    <v-card-text :style="`background-color: ${$vuetify.theme.themes.light.highlight};`" >
      {{ entrieFolderDownloadDescription }}
    </v-card-text>

  </v-card>

</template>

<script>
import IconButton from './IconButton';

export default {
  name: 'DownloadToolsCard',
  props: {
    dark: Boolean,
    tools: {
      type: Array,
      default: () => [{
        title: 'CyberDuck',
        toolTip: 'Use CyberDuck to access the files.',
        image: 'cyberduck-icon-64.png',
        href: null,
        clickCallback: () => {
          // console.log('clicked on Cyberduck');
        },
        moreInfoUrl: 'https://cyberduck.io/',
      }],
    },
    selectedFolder: String,
    highlightTitle: Boolean,
    loading: Boolean,
  },
  data: () => ({
    title: 'Directory download with other protocols',
    subTitle: 'folder with other protocols',
    entrieFolderDownloadDescription: 'To download all files from a directory select it in the list, and choose the tools you would want to access this directory. There can be many files and large ones. If your interested in specific files use the file selection to download them.',
  }),
  methods: {
    clickShowDesc(tool) {
      tool.showDescription = !tool.showDescription;
    },
  },
  components: {
    IconButton,
  },
};
</script>
