import { userService } from '../_services';

export const users = {
    namespaced: true,
    state: {
        me: {}
    },
    actions: {
        getMe({ commit }) {
            commit('getMeRequest');

            userService.getMe()
                .then(
                    user => commit('getMeSuccess', user),
                    error => commit('getMeFailure', error)
                );
        }
    },
    mutations: {
        getMeRequest(state) {
            state.me = { loading: true };
        },
        getMeSuccess(state, me) {
            state.me = me;
        },
        getMeFailure(state, error) {
            state.me = { error };
        }
    }
}
