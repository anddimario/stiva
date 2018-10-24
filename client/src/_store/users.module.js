import { userService } from '../_services';

export const users = {
    namespaced: true,
    state: {
        all: {}
    },
    actions: {
        getMe({ commit }) {
            commit('getMeRequest');

            userService.getMe()
                .then(
                    users => commit('getMeSuccess', users),
                    error => commit('getMeFailure', error)
                );
        }
    },
    mutations: {
        getMeRequest(state) {
            state.all = { loading: true };
        },
        getMeSuccess(state, users) {
            state.all = { items: users };
        },
        getMeFailure(state, error) {
            state.all = { error };
        }
    }
}
