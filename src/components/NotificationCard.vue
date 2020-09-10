<template>
  <v-card height="165"
          class="elevation-3"
          :color="color">

    <v-card-title >
      <v-row align-content="center" no-gutters>

        <v-col cols="1" >
          <v-icon>{{ icon }}</v-icon>
        </v-col>

        <v-col cols="11">
          <div class="title">{{ title }}</div>
        </v-col>

      </v-row>
    </v-card-title>

    <v-card-text v-html="message" />

  </v-card>
</template>

<script>
/**
 * NotificationCard.vue is used to show infos, warnings and errors
 * to the user.
 *
 * @summary card for notifications
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 14:11:27
 * Last modified  : 2020-09-02 17:42:13
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
*/

export default {
  components: {
  },
  props: {
    title: {
      type: String,
      default: 'Unknow Error',
    },
    icon: {
      type: String,
      default: 'mdi-alert-circle',
    },
    color: {
      type: String,
      default: 'error',
    },
    message: {
      type: String,
      default: 'Apparently something unexpected happend or there was server error. Try reloading and make sure are online!',
    },
  },
};
</script>
