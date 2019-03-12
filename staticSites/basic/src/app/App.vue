<template>
  <div class="jumbotron">

    <div class="container">
      <div class="row">
        <div class="col-sm-3">
          <Navigation></Navigation>
          <select v-model="selectedLanguage">
            <option v-for="lang in languages" :key="lang.short" :value="lang">{{lang.long}}</option>
          </select>
        </div>
        <div class="col-sm-9">
          <div v-if="alert.message" :class="`alert ${alert.type}`">{{alert.message}}</div>
            <router-view></router-view>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Vue from 'vue';
import Navigation from '../components/Navigation';

export default {
    name: 'app',
  data() {
    return {
      selectedLanguage: this.$store.state.lang.curLanguage
    };
  },
  created() {
    // console.log('created', this.$store.state.lang.curLanguage);
    Vue.i18n.set(this.$store.state.lang.curLanguage.short);
  },
    computed: {
        ...mapState({
            alert: state => state.alert,
          languages: state => state.lang.languages
        })
    },
    methods: {
        ...mapActions({
            clearAlert: 'alert/clear'
        })
    },
    watch: {
        $route (to, from){
            // clear alert on location change
            this.clearAlert();
        },
    selectedLanguage: function(newLang) {
      // console.log('new lang selected', newLang);
      Vue.i18n.set(newLang.short);
      this.$store.commit("setLanguage", newLang.short);
    }

  },
  components: {
    'Navigation': Navigation
  }
};
</script>
