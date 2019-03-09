<template>
    <div>
        <div v-if="me.userRole === 'admin'">

          <h2>Add Content</h2>
          <form @submit.prevent="handleSubmit">
              <div class="form-group">
                  <label for="title">Title</label>
                  <input type="text" v-model="content.title" v-validate="'required'" name="title" class="form-control" :class="{ 'is-invalid': submitted && errors.has('title') }" />
                  <div v-if="submitted && errors.has('title')" class="invalid-feedback">{{ errors.first('title') }}</div>
              </div>
              <div class="form-group">
                  <button class="btn btn-primary" :disabled="added.loading">Add</button>
                  <img v-show="added.loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                  <router-link to="/" class="btn btn-link">Cancel</router-link>
              </div>
          </form>
            <p v-if="added.error">{{ added.error }}</p>
            <p v-if="added.done">Content added</p>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      content: {
        contentType: "post",
        title: "",
      },
      submitted: false
    };
  },
  created() {
    this.getMe();
  },
  computed: {
    ...mapState({
      me: state => state.users.me,
      added: state => state.contents.added
    })
  },
  methods: {
    ...mapActions("users", {
      getMe: "getMe",
    }),
    ...mapActions("contents", {
      add: "add"
    }),
    handleSubmit(e) {
      this.submitted = true;
      this.$validator.validate().then(valid => {
        if (valid) {
        console.log(this.content)
          this.add(this.content);
        }
      });
    }
  }
};
</script>
