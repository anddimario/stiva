<template>
    <div>
        <div v-if="me.userRole === 'admin'">
            <h3>Contents:</h3>
            <em v-if="contents.loading">Loading contents...</em>
            <span v-if="contents.error" class="text-danger">ERROR: {{contents.error}}</span>
            <ul v-if="contents.items">
                <li v-for="content in contents.items" :key="content.id">
                    {{content.title}} {{ content.contentType}}
                    <span v-if="content.deleting"><em> - Deleting...</em></span>
                    <span v-else-if="content.deleteError" class="text-danger"> - ERROR: {{content.deleteError}}</span>
                    <span v-else> - <a @click="deleteContent({id: content.id, contentType: 'post'})" class="text-danger">Delete</a></span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      submitted: false
    };
  },
  computed: {
    ...mapState({
      me: state => state.users.me,
      contents: state => state.contents.list
    })
  },
  created() {
    this.getMe();
    this.list("post");
  },
  methods: {
    ...mapActions("users", {
      getMe: "getMe"
    }),
    ...mapActions("contents", {
      list: "list",
      deleteContent: "delete"
    })
  }
};
</script>
