<template>
    <div>
        <h1>Hi {{me.fullname}}!</h1>
        <em v-if="me.loading">Loading me...</em>
        <ul v-if="me.userRole === 'admin'">
            <li><router-link to="/users/add">Add user</router-link></li>
        </ul>
        <ul>
            <li><router-link to="/users/update">Update user</router-link></li>
        </ul>
        <div v-if="me.userRole === 'admin'">
            <h3>Users from secure api end point:</h3>
            <em v-if="users.loading">Loading users...</em>
            <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
            <ul v-if="users.items">
                <li v-for="user in users.items" :key="user.email">
                    {{user.email + ' ' + user.userRole}}
                    <span v-if="user.deleting"><em> - Deleting...</em></span>
                    <span v-else-if="user.deleteError" class="text-danger"> - ERROR: {{user.deleteError}}</span>
                    <span v-else> - <a @click="deleteUser(user.email)" class="text-danger">Delete</a></span>
                </li>
            </ul>

            <form @submit.prevent="searchUserSubmit">
                <div class="form-group">
                    <label for="email">Search by email</label>
                    <input type="text" v-model="email" name="email" class="form-control" :class="{ 'is-invalid': submitted && !email }" />
                    <div v-show="submitted && !email" class="invalid-feedback">Email is required</div>
                </div>
                <div class="form-group">
                    <button class="btn btn-primary" :disabled="user.loading">Search</button>
                    <img v-show="user.loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                </div>
            </form>
            <p v-if="user.email">{{ user.fullname }} {{ user.email }} {{user.userRole}}</p>
            <p v-if="user.error">{{ user.error }}</p>

        </div>
        <p>
            <router-link to="/login">Logout</router-link>
        </p>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      email: "",
      submitted: false
    };
  },
  computed: {
    ...mapState({
      account: state => state.account,
      me: state => state.users.me,
      users: state => state.users.all,
      user: state => state.users.user
    })
  },
  created() {
    this.getMe();
  },
  methods: {
    ...mapActions("users", {
      getMe: "getMe",
      getByEmail: "getByEmail",
      getAllUsers: "getAll",
      deleteUser: "delete"
    }),
    searchUserSubmit(e) {
      this.submitted = true;
      const { email } = this;
      if (email) {
        this.getByEmail(email);
      }
    }
  },
  watch: {
    me: function() {
      if (this.me.userRole) {
        if (this.me.userRole === "admin") {
          this.getAllUsers();
        }
      }
    }
  }
};
</script>