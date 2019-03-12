<template>
  <div>
    <nav>
      <router-link to="/">
        Home
      </router-link>
      <router-link
        v-if="status && status.loggedIn !== true"
        to="/login"
      >
        Login
      </router-link>
      <router-link
        v-if="me && me.userRole"
        to="/"
        @click.native="logout"
      >
        Logout
      </router-link>
    </nav>
    <div v-if="me && me.userRole && me.fullname">
      <h1>Hi {{ me.fullname }}!</h1>
      <em v-if="me.loading">Loading me...</em>
    </div>
    <ul v-if="me && me.userRole">
      <li v-if="me.userRole">
        <router-link to="/dash">
          Dashboard
        </router-link>
      </li>

      <li>
        USER
        <ul>
          <li v-if="me.userRole === 'admin'">
            <router-link to="/users/list">
              List
            </router-link>
          </li>
          <li v-if="me.userRole === 'admin'">
            <router-link to="/users/add">
              Add
            </router-link>
          </li>

          <li v-if="me.userRole">
            <router-link to="/users/update">
              Update
            </router-link>
          </li>
        </ul>
      </li>
      <li>
        CONTENTS
        <ul>
          <li v-if="me.userRole === 'admin'">
            <router-link to="/contents/add">
              Add
            </router-link>
          </li>
          <li v-if="me.userRole === 'admin'">
            <router-link to="/contents">
              List
            </router-link>
          </li>
        </ul>
      </li>
      <li>
        FILES
        <ul>
          <li v-if="me.userRole">
            <router-link to="/uploads">
              Uploads
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState({
      me: state => state.users.me,
      status: state => state.account.status,
    })
  },
  methods: {
    ...mapActions('account', {
      logout: 'logout',
    }),
  }
};
</script>
