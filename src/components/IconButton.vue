<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-bind="attrs"
        icon
        :color="color"
        :dark="dark"
        :href="url ? url : ''"
        target="_blank"
        @click="
          clickCallback ? clickCallback() : $emit('click');
          snackbar = true;
        "
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>

    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'IconButton',
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    tooltipText: String,
    icon: String,
    url: String,
    clickCallback: Function,
    color: {
      type: String,
      default: '',
    },
  },
  data: () => ({}),
  computed: {},
};
</script>
