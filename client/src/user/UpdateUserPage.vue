<template>
    <div>

          <div v-if="me.userRole === 'admin'">
            You are an admin, you can edit all user
          </div>
          <h2>Update User</h2>
          <form @submit.prevent="updateSubmit('userUpdate')" data-vv-scope="userUpdate">
            <input type="hidden" name="type" value="user">
              <div class="form-group">
                  <label for="fullname">Full Name</label>
                  <input type="text" v-model="user.fullname" v-validate="'required'" name="fullname" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userUpdate.fullname') }" :placeholder="me.fullname" />
                  <div v-if="submitted && errors.has('userUpdate.fullname')" class="invalid-feedback">{{ errors.first('userUpdate.fullname') }}</div>
              </div>
              <div v-if="me.userRole === 'admin'">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="text" v-model="user.email" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userUpdate.email') }" />
                    <div v-if="submitted && errors.has('userUpdate.email')" class="invalid-feedback">{{ errors.first('userUpdate.email') }}</div>
                </div>
                <div class="form-group">
                    <label for="userRole">User Role</label>
                    <input type="text" v-model="user.userRole" v-validate="'required'" name="userRole" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userUpdate.userRole') }" />
                    <div v-if="submitted && errors.has('userUpdate.userRole')" class="invalid-feedback">{{ errors.first('userUpdate.userRole') }}</div>
                </div>
              </div>
              <div class="form-group">
                  <button class="btn btn-primary" :disabled="updatedUser.loading">Update</button>
                  <img v-show="updatedUser.loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                  <router-link to="/" class="btn btn-link">Cancel</router-link>
              </div>
          </form>
          <p v-if="updatedUser.error">{{ updatedUser.error }}</p>
          <p v-if="updatedUser.done">User updated</p>
          <h2>Update Password</h2>
          <form @submit.prevent="updateSubmit('userPasswordUpdate')" data-vv-scope="userPasswordUpdate">
            <input type="hidden" name="type" value="password">
              <div v-if="me.userRole === 'admin'">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="text" v-model="user.email" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userUpdate.email') }" />
                    <div v-if="submitted && errors.has('userUpdate.email')" class="invalid-feedback">{{ errors.first('userUpdate.email') }}</div>
                </div>
              </div>
              <div class="form-group">
                  <label htmlFor="new">New Password</label>
                  <input type="password" v-model="password.new" v-validate="{ required: true, min: 6 }" name="new" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userPasswordUpdate.new') }" ref="new" />
                  <div v-if="submitted && errors.has('userPasswordUpdate.new')" class="invalid-feedback">{{ errors.first('userPasswordUpdate.new') }}</div>
              </div>
              <div class="form-group">
                  <label htmlFor="repeat">Repeat Password</label>
                  <input type="password" v-model="password.repeat" v-validate="{ required: true, min: 6, confirmed: 'new' }" name="repeat" class="form-control" :class="{ 'is-invalid': submitted && errors.has('userPasswordUpdate.repeat') }" />
                  <div v-if="submitted && errors.has('userPasswordUpdate.repeat')" class="invalid-feedback">{{ errors.first('userPasswordUpdate.repeat') }}</div>
              </div>
              <div class="form-group">
                  <button class="btn btn-primary" :disabled="updatedPassword.loading">Update</button>
                  <img v-show="updatedPassword.loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                  <router-link to="/" class="btn btn-link">Cancel</router-link>
              </div>
          </form>
          <p v-if="updatedPassword.error">{{ updatedPassword.error }}</p>
          <p v-if="updatedPassword.done">Password updated</p>
        </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      user: {
        fullname: "",
        email: "",
        userRole: ""
      },
      password: {
        email: "",
        new: "",
        repeat: ""
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
      updatedUser: state => state.users.updatedUser,
      updatedPassword: state => state.users.updatedPassword
    })
  },
  methods: {
    ...mapActions("users", {
      getMe: "getMe",
      update: "update",
      updatePassword: "updatePassword"
    }),
    updateSubmit(e) {
      this.submitted = true;
      this.$validator.validateAll(e).then(valid => {
        if (valid) {
          if (this.password.new && this.password.repeat) {
            this.updatePassword(this.password);
          } else if (Object.keys(this.user).length > 0) {
            this.update(this.user);
          }
        }
      });
    }
  }
};
</script>