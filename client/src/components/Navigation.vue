<template>
  <div>
    <h2>Nav Bar</h2>
    <nav>
      <router-link to="/" v-if="me.userRole">Home</router-link>
      <router-link to="/login" v-if="me.userRole">Logout</router-link>
    </nav>
    <div v-if="me.userRole">
      <h1>Hi {{me.fullname}}!</h1>
      <em v-if="me.loading">Loading me...</em>
    </div>
    <ul>
        <li v-if="me.userRole === 'admin'"><router-link to="/users/add">Add user</router-link></li>
        <li v-if="me.userRole === 'admin'"><router-link to="/contents/add">Add content</router-link></li>
        <li v-if="me.userRole === 'admin'"><router-link to="/contents">List contents</router-link></li>
        <li v-if="me.userRole"><router-link to="/users/update">Update user</router-link></li>
        <li v-if="me.userRole"><router-link to="/uploads">Uploads</router-link></li>
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
