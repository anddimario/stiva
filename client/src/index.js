import Vue from 'vue';
import VeeValidate from 'vee-validate';

import { store } from './_store';
import { router } from './_helpers';
import App from './app/App';

Vue.use(VeeValidate);
// set the start locale to use
Vue.i18n.set('it'); // set in app based on state

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
