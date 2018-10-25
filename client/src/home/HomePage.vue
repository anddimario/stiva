<template>
    <div>
        <em v-if="me.loading">Loading me...</em>
        <h1>Hi {{ me.fullname }}!</h1>
        <p>You're logged in with Vue + Vuex & JWT!!</p>
       <!--
        <h3>Users from secure api end point:</h3>
        <em v-if="users.loading">Loading users...</em>
        <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
        <ul v-if="users.items">
            <li v-for="user in users.items" :key="user.id">
                {{user.firstName + ' ' + user.lastName}}
            </li>
        </ul>
        -->
        <p>
            <router-link to="/login">Logout</router-link>
        </p>
    </div>
</template>

<script>
export default {
    computed: {
        user () {
            return this.$store.state.authentication.user;
        },
        me () {
            return this.$store.state.users.me;
        }
    },
    created () {
        this.$store.dispatch('users/getMe');
    }
};
</script>
