<template>

  <v-card max-height="100%">

    <v-card-title primary-title>
      <v-row no-gutters align="center">
        <v-col v-if="expanded">
          {{ title }}
        </v-col>
        <v-col class="shrink"
                cols="1">
          <v-btn icon
                  :disabled="loading"
                  @click="$emit('expand')">
            <v-icon>mdi-information</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text v-if="expanded"
                  :style="`max-height: ${height}; overflow:auto;`">
      <v-text-field :value="name"
                    label="name"
                    id="0"
                    readonly />

      <v-text-field class="pt-1"
                    :value="url"
                    label="url"
                    id="1"
                    readonly />

      <v-text-field class="pt-1"
                    :value="prefix"
                    label="prefix"
                    id="2"
                    readonly />

      <v-text-field class="pt-1"
                    :value="maxKeys"
                    label="maxKeys"
                    id="3"
                    readonly />

      <v-text-field class="pt-1"
                    :value="delimiter"
                    label="delimiter"
                    id="4"
                    readonly />

      <v-checkbox class="pt-1"
                    label="isTruncated"
                    :value="isTruncated"
                    id="5"
                    readonly />

      <v-text-field class="pt-1"
                    :value="marker"
                    label="marker"
                    id="6"
                    readonly />

    </v-card-text>
  </v-card>

</template>

<script>

export default {
  name: 'BucketCard',
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },
    name: String,
    url: String,
    prefix: String,
    maxKeys: String,
    delimiter: String,
    isTruncated: Boolean,
    marker: String,
    height: {
      type: String,
      default: '75vh',
    },
    loading: Boolean,
  },
  data: () => ({
    title: 'List Bucket Infos',
  }),
  computed: {
  },
};
</script>
