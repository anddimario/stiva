<template>
  <div>
      <h3>Uploads</h3>
      <em v-if="uploads.loading">Loading uploads...</em>
      <span
        v-if="uploads.error"
        class="text-danger"
      >ERROR: {{ uploads.error }}</span>
      <ul v-if="uploads.Contents">
        <li
          v-for="upload in uploads.Contents"
          :key="upload.Key"
        >
          {{ upload.Key }}
          <span v-if="upload.deleting"><em> - Deleting...</em></span>
          <span
            v-else-if="upload.deleteError"
            class="text-danger"
          > - ERROR: {{ upload.deleteError }}</span>
          <span v-else> - <a
            class="text-danger"
            @click="deleteUpload(upload.Key)"
          >Delete</a></span>
        </li>
      </ul>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
    };
  },
  created() {
    this.getMe();
    this.list();
  },
  computed: {
    ...mapState({
      me: state => state.users.me,
      uploads: state => state.uploads.list
    })
  },
  methods: {
    ...mapActions('users', {
      getMe: 'getMe',
    }),
    ...mapActions('uploads', {
      list: 'list',
      deleteUpload: 'delete'
    }),
  }
};
</script>
