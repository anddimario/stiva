import { userService } from '../_services';

const state = {
    all: {},
    me: {},
    user: {},
    added: {},
    updatedUser: {},
    updatedPassword: {},
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

    getByEmail({ commit }, email) {
        commit('getByEmailRequest');

        userService.getByEmail(email)
            .then(
                user => commit('getByEmailSuccess', user),
                error => commit('getByEmailFailure', error)
            );
    },

    getAll({ commit }) {
        commit('getAllRequest');

        userService.getAll()
            .then(
                users => commit('getAllSuccess', users),
                error => commit('getAllFailure', error)
            );
    },

    add({ commit }, user) {
        commit('addRequest');

        userService.add(user)
            .then(
                user => commit('addSuccess', user),
                error => commit('addFailure', error)
            );
    },

    update({ commit }, user) {
        commit('updateRequest');

        userService.update(user)
            .then(
                user => commit('updateSuccess', user),
                error => commit('updateFailure', error)
            );
    },

    updatePassword({ commit }, password) {
        commit('updatePasswordRequest');

        userService.updatePassword(password)
            .then(
                password => commit('updatePasswordSuccess', password),
                error => commit('updatePasswordFailure', error)
            );
    },

    delete({ commit }, email) {
        commit('deleteRequest', email);

        userService.delete(email)
            .then(
                user => commit('deleteSuccess', email),
                error => commit('deleteSuccess', { email, error: error.toString() })
            );
    }
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
    getByEmailRequest(state) {
        state.user = { loading: true };
    },
    getByEmailSuccess(state, user) {
        state.user = user;
    },
    getByEmailFailure(state, error) {
        state.user = { error };
    },
    getAllRequest(state) {
        state.all = { loading: true };
    },
    getAllSuccess(state, users) {
        state.all = { items: users };
    },
    getAllFailure(state, error) {
        state.all = { error };
    },
    addRequest(state) {
        state.added = { loading: true };
    },
    addSuccess(state) {
        state.added = { done: true };
    },
    addFailure(state, error) {
        state.added = { error };
    },
    updateRequest(state) {
        state.updatedUser = { loading: true };
    },
    updateSuccess(state) {
        state.updatedUser = { done: true };
    },
    updateFailure(state, error) {
        state.updatedUser = { error };
    },
    updatePasswordRequest(state) {
        state.updatedPassword = { loading: true };
    },
    updatePasswordSuccess(state) {
        state.updatedPassword = { done: true };
    },
    updatePasswordFailure(state, error) {
        state.updatedPassword = { error };
    },
    deleteRequest(state, email) {
        // add 'deleting:true' property to user being deleted
        state.all.items = state.all.items.map(user =>
            user.email === email
                ? { ...user, deleting: true }
                : user
        )
    },
    deleteSuccess(state, email) {
        // remove deleted user from state
        state.all.items = state.all.items.filter(user => user.email !== email)
    },
    deleteFailure(state, { email, error }) {
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user 
        state.all.items = state.items.map(user => {
            if (user.email === email) {
                // make copy of user without 'deleting:true' property
                const { deleting, ...userCopy } = user;
                // return copy of user with 'deleteError:[error]' property
                return { ...userCopy, deleteError: error };
            }

            return user;
        })
    }
};

export const users = {
    namespaced: true,
    state,
    actions,
    mutations
};
