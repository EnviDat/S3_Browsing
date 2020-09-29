<template>
  <v-card >

    <v-card-title primary-title>
      {{ title }}
    </v-card-title>

    <v-card-text >

      <v-row v-for="(tool, index) in tools"
              :key="`${tool.title}_${index}`"
              align="center"
              justify="start"
              class="py-1"
              no-gutters >

        <v-col class="shrink">
          <v-tooltip bottom >

            <template v-slot:activator="{ on, attrs }">
              <v-btn v-on="on"
                      v-bind="attrs"
                      color="primary"
                      fab
                      small
                      :dark="dark"
                      :href="tool.href ? tool.href : ''"
                      :download="tool.downloadFileName ? tool.downloadFileName : null"
                      target="_blank"
                      @click="!tool.href && tool.clickCallback ? tool.clickCallback() : $emit('click');">

                <!-- <v-img :src="tool.image" height="32" width="32" /> -->
                <img :src="tool.image" style="width: 30px; border-radius: 50%;" />
              </v-btn>
            </template>
              
            <span>{{ tool.toolTip }}</span>

          </v-tooltip>
        </v-col>

        <v-col class="px-2">
          {{ tool.title }}
        </v-col>

        <v-col >
          <v-btn color="secondary"
                  :dark="dark"
                  text
                  small
                  target="_blank"
                  :href="tool.moreInfoUrl"
                  @click="tool.clickCallback ? tool.clickCallback() : $emit('click');">
            Read More
            <span class="pl-2">
              <v-icon>mdi-open-in-new</v-icon>
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
        clickCallback: () => { console.log('clicked on Cyberduck'); },
        moreInfoUrl: 'https://cyberduck.io/',
      }],
    },
    loading: Boolean,
  },
  data: () => ({
    title: 'Open With Other Protocols',
  }),
  computed: {
  },
  components: {
    IconButton,
  },
};
</script>
