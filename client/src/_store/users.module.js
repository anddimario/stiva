import { userService } from '../_services';

const state = {
    //all: {}
    me: {}
};

const actions = {
    getMe({ commit }) {
        commit('getMeRequest');

        userService.getMe()
            .then(
                user => commit('getMeSuccess', user),
                error => commit('getMeFailure', error)
            );
    },
    /*
    getAll({ commit }) {
        commit('getAllRequest');

        userService.getAll()
            .then(
                users => commit('getAllSuccess', users),
                error => commit('getAllFailure', error)
            );
    },

    delete({ commit }, id) {
        commit('deleteRequest', id);

        userService.delete(id)
            .then(
                user => commit('deleteSuccess', id),
                error => commit('deleteSuccess', { id, error: error.toString() })
            );
    }
    */
};

const mutations = {
    getMeRequest(state) {
        state.me = { loading: true };
    },
    getMeSuccess(state, me) {
        state.me = me;
    },
    getMeFailure(state, error) {
        state.me = { error };
    },
    /*
    getAllRequest(state) {
        state.all = { loading: true };
    },
    getAllSuccess(state, users) {
        state.all = { items: users };
    },
    getAllFailure(state, error) {
        state.all = { error };
    },
    deleteRequest(state, id) {
        // add 'deleting:true' property to user being deleted
        state.all.items = state.all.items.map(user =>
            user.id === id
                ? { ...user, deleting: true }
                : user
        )
    },
    deleteSuccess(state, id) {
        // remove deleted user from state
        state.all.items = state.all.items.filter(user => user.id !== id)
    },
    deleteFailure(state, { id, error }) {
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user 
        state.all.items = state.items.map(user => {
            if (user.id === id) {
                // make copy of user without 'deleting:true' property
                const { deleting, ...userCopy } = user;
                // return copy of user with 'deleteError:[error]' property
                return { ...userCopy, deleteError: error };
            }

            return user;
        })
    }
    */
};

export const users = {
    namespaced: true,
    state,
    actions,
    mutations
};
