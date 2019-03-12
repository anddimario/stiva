<template>
  <div>
    <div v-if="me.userRole === 'admin'">
      <h2>Add User</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="fullname">Full Name</label>
          <input
            v-model="user.fullname"
            v-validate="'required'"
            type="text"
            name="fullname"
            class="form-control"
            :class="{ 'is-invalid': submitted && errors.has('fullname') }"
          >
          <div
            v-if="submitted && errors.has('fullname')"
            class="invalid-feedback"
          >
            {{ errors.first('fullname') }}
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="user.email"
            v-validate="'required'"
            type="text"
            name="email"
            class="form-control"
            :class="{ 'is-invalid': submitted && errors.has('email') }"
          >
          <div
            v-if="submitted && errors.has('email')"
            class="invalid-feedback"
          >
            {{ errors.first('email') }}
          </div>
        </div>
        <div class="form-group">
          <label htmlFor="password">Password</label>
          <input
            v-model="user.password"
            v-validate="{ required: true, min: 6 }"
            type="password"
            name="password"
            class="form-control"
            :class="{ 'is-invalid': submitted && errors.has('password') }"
          >
          <div
            v-if="submitted && errors.has('password')"
            class="invalid-feedback"
          >
            {{ errors.first('password') }}
          </div>
        </div>
        <div class="form-group">
          <label for="userRole">User Role</label>
          <input
            v-model="user.userRole"
            v-validate="'required'"
            type="text"
            name="userRole"
            class="form-control"
            :class="{ 'is-invalid': submitted && errors.has('userRole') }"
          >
          <div
            v-if="submitted && errors.has('userRole')"
            class="invalid-feedback"
          >
            {{ errors.first('userRole') }}
          </div>
        </div>
        <div class="form-group">
          <button
            class="btn btn-primary"
            :disabled="added.loading"
          >
            Add
          </button>
          <img
            v-show="added.loading"
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
      <p v-if="added.error">
        {{ added.error }}
      </p>
      <p v-if="added.done">
        User added
      </p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      user: {
        fullname: '',
        email: '',
        password: '',
        userRole: ''
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
      added: state => state.users.added
    })
  },
  methods: {
    ...mapActions('users', {
      getMe: 'getMe',
      add: 'add'
    }),
    handleSubmit(e) {
      this.submitted = true;
      this.$validator.validate().then(valid => {
        if (valid) {
          this.add(this.user);
        }
      });
    }
  }
};
</script>