import { contentService } from '../_services';

const state = {
//    all: {},
    added: {},
};

const actions = {

    add({ commit }, content) {
        commit('addRequest');

        contentService.add(content)
            .then(
                content => commit('addSuccess', content),
                error => commit('addFailure', error)
            );
    },
};

const mutations = {

    addRequest(state) {
        state.added = { loading: true };
    },
    addSuccess(state) {
        state.added = { done: true };
    },
    addFailure(state, error) {
        state.added = { error };
    },
  };

export const contents = {
    namespaced: true,
    state,
    actions,
    mutations
};
