<template>
  <v-card ripple hover style="height: 100%; max-height: 375px !important">
    <v-img
      :style="`background-color: ${$vuetify.theme.themes.light.secondary}`"
      :height="$vuetify.breakpoint.smAndDown ? '100px' : '125px'"
    >
      <v-container class="fill-height py-0" style="position: absolute">
        <v-row>
          <v-col class="py-0" cols="12">
            <v-row align="start">
              <v-col cols="12">
                <div
                  class="skeleton skeleton-size-big skeleton-color-concrete skeleton-animation-shimmer"
                >
                  <div class="bone bone-type-multiline bone-style-steps" />
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-img>

    <v-card-text primary-title>
      <div
        class="skeleton skeleton-color-silver skeleton-animation-shimmer"
        style="width: 100%"
      >
        <div class="bone bone-type-multiline" />
        <div class="bone bone-type-multiline bone-style-paragraph" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
// checkout skeleton
// https://github.com/ToxicJojo/SkeletonPlaceholder

export default {
  components: {},
  props: {},
  data: () => ({}),
  computed: {},
  created() {},
  methods: {},
};
</script>
