<template>
  <div>
    <div v-if="me.userRole === 'admin'">
      <form @submit.prevent="searchContentsSubmit">
        <div class="form-group">
          <label for="filters">Search by filters</label>
          <input
            v-model="filters"
            type="text"
            name="filters"
            class="form-control"
            :class="{ 'is-invalid': submitted && !filters }"
          >
          <div
            v-show="submitted && !filters"
            class="invalid-feedback"
          >
            Filters is required
          </div>
        </div>
        <div class="form-group">
          <button
            class="btn btn-primary"
          >
            Search
          </button>
        </div>
      </form>


      <div v-if="loadedContent.id">
        <h2>Update Content</h2>
        <form
          data-vv-scope="update"
          @submit.prevent="updateSubmit()"
        >
          <input
            type="hidden"
            name="type"
            value="content"
          >
          <div class="form-group">
            <label for="title">Title</label>
            <input
              v-model="loadedContent.title"
              v-validate="'required'"
              type="text"
              name="title"
              class="form-control"
              :class="{ 'is-invalid': submitted && errors.has('loadedContent.title') }"
              :placeholder="loadedContent.title"
            >
            <div
              v-if="submitted && errors.has('loadedContent.title')"
              class="invalid-feedback"
            >
              {{ errors.first('loadedContent.title') }}
            </div>
          </div>
          <div class="form-group">
            <label for="contentText">Text</label>
            <input
              v-model="loadedContent.contentText"
              v-validate="'required'"
              type="text"
              name="contentText"
              class="form-control"
              :class="{ 'is-invalid': submitted && errors.has('loadedContent.contentText') }"
              :placeholder="loadedContent.contentText"
            >
            <div
              v-if="submitted && errors.has('loadedContent.contentText')"
              class="invalid-feedback"
            >
              {{ errors.first('loadedContent.contentText') }}
            </div>
          </div>
          <div class="form-group">
            <button
              class="btn btn-primary"
              :disabled="updated.loading"
            >
              Update
            </button>
            <img
              v-show="updated.loading"
              src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
            >
            <router-link
              to="/"
              class="btn btn-link"
            >
              Cancel
            </router-link>
          </div>
        </form>
        <p v-if="updated.error">
          {{ updated.error }}
        </p>
        <p v-if="updated.done">
          Content updated
        </p>
      </div>
      <h3>Contents:</h3>
      <em v-if="contents.loading">Loading contents...</em>
      <span
        v-if="contents.error"
        class="text-danger"
      >ERROR: {{ contents.error }}</span>
      <ul v-if="contents.items">
        <li
          v-for="content in contents.items"
          :key="content.id"
        >
          {{ content.title }} {{ content.contentType }}
          <span v-if="content.deleting"><em> - Deleting...</em></span>
          <span
            v-else-if="content.deleteError"
            class="text-danger"
          > - ERROR: {{ content.deleteError }}</span>
          <span v-else> - <a
            class="text-danger"
            @click="deleteContent({id: content.id, contentType: 'post'})"
          >Delete</a><a @click="loadContent({id: content.id, contentType: 'post'})">Update</a></span>
        </li>
      </ul>
      <p v-if="next">
        {{ next }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      submitted: false,
      filters: ''
    };
  },
  computed: {
    ...mapState({
      me: state => state.users.me,
      contents: state => state.contents.list,
      next: state => state.contents.next,
      updated: state => state.contents.updated,
      loadedContent: state => state.contents.loadedContent
    })
  },
  created() {
    this.getMe();
    this.list({
      contentType: 'post'
    });
  },
  methods: {
    ...mapActions('users', {
      getMe: 'getMe'
    }),
    ...mapActions('contents', {
      list: 'list',
      deleteContent: 'delete',
      update: 'update',
      getContent: 'get'
    }),
    loadContent(e) {
      // get content based on id and populate update form
      this.getContent(e);
    },
    updateSubmit(e) {
      this.submitted = true;
      this.$validator.validateAll(e).then(valid => {
        if (valid) {
          this.update(this.loadedContent);
        }
      });
    },
    searchContentsSubmit(e) {
      this.submitted = true;
      this.list({
        contentType: 'post',
        filters: this.filters
      });
    }
  }
};
</script>
