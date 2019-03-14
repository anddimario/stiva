import Vue from 'vue';
import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';

import translationsEn from '../lang/en.json';
import translationsIt from '../lang/it.json';

import { alert } from './alert.module';
import { account } from './account.module';
import { users } from './users.module';
import { contents } from './contents.module';
import { lang } from './lang.module';
import { uploads } from './uploads.module';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    alert,
    account,
    users,
    contents,
    lang,
    uploads
  }
});

Vue.use(vuexI18n.plugin, store);

// add translations directly to the application
Vue.i18n.add('en', translationsEn);
Vue.i18n.add('it', translationsIt);

export {
  store
};

