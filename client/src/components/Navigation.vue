<template>
  <div>
    <h2>Nav Bar</h2>
    <nav>
      <router-link to="/" v-if="me.userRole">Home</router-link>
      <router-link to="/login">Logout</router-link>
    </nav>
    <h1>Hi {{me.fullname}}!</h1>
    <em v-if="me.loading">Loading me...</em>
    <ul>
        <li v-if="me.userRole === 'admin'"><router-link to="/users/add">Add user</router-link></li>
        <li><router-link to="/users/update">Update user</router-link></li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState({
      me: state => state.users.me,
    })
  }
};
</script>
