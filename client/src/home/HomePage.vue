<template>
    <div>
        <h1>Hi {{me.fullname}}!</h1>
        <em v-if="me.loading">Loading me...</em>
        <ul v-if="me.userRole === 'admin'">
            <li>Add user</li>
        </ul>
        <ul>
            <li>Update</li>
        </ul>
        <!--
        <h1>Hi {{account.user.firstName}}!</h1>
        <p>You're logged in with Vue + Vuex & JWT!!</p>
        <h3>Users from secure api end point:</h3>
        <em v-if="users.loading">Loading users...</em>
        <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
        <ul v-if="users.items">
            <li v-for="user in users.items" :key="user.id">
                {{user.firstName + ' ' + user.lastName}}
                <span v-if="user.deleting"><em> - Deleting...</em></span>
                <span v-else-if="user.deleteError" class="text-danger"> - ERROR: {{user.deleteError}}</span>
                <span v-else> - <a @click="deleteUser(user.id)" class="text-danger">Delete</a></span>
            </li>
        </ul>
        -->
        <p>
            <router-link to="/login">Logout</router-link>
        </p>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    computed: {
        ...mapState({
            account: state => state.account,
            me: state => state.users.me
            //users: state => state.users.all
        })
    },
    created () {
        //this.getAllUsers();
        this.getMe();
    },
    methods: {
        ...mapActions('users', {
            getMe: 'getMe'
            //getAllUsers: 'getAll',
            //deleteUser: 'delete'
        })
    }
};
</script>