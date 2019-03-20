<template>
  <div>
    <h2>Recovery Password</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label htmlFor="password">Password</label>
        <input
          v-model="password"
          type="password"
          name="password"
          class="form-control"
          :class="{ 'is-invalid': submitted && !password }"
        >
        <div
          v-show="submitted && !password"
          class="invalid-feedback"
        >
          Password is required
        </div>
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary"
          :disabled="recoveringPassword.loading"
        >
          Login
        </button>
        <img
          v-show="recoveringPassword.loading"
          src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
        >
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data () {
    return {
      password: '',
      submitted: false
    };
  },
  computed: {
    ...mapState('account', ['recoveringPassword']),
  },
  created () {
    // reset login status
    this.logout();
  },
  methods: {
    ...mapActions('account', ['recoveryPassword', 'logout']),
    handleSubmit (e) {
      this.submitted = true;
      const { password } = this;
      // get token from querystring
      // https://router.vuejs.org/guide/essentials/dynamic-matching.html#catch-all-404-not-found-route
      const token = this.$route.query.token;
      if (password && token) {
        this.recoveryPassword({ password, token });
      }
    }
  }
};
</script>
