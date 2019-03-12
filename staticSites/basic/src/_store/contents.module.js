import { contentService } from '../_services';

const state = {
    list: {},
    added: {},
    loadedContent: {},
    updated: {}
};

const actions = {
    get({ commit }, content) {
        commit('getRequest');

        contentService.get(content)
            .then(
                content => commit('getSuccess', content),
                error => commit('getFailure', error)
            );
    },

    add({ commit }, content) {
        commit('addRequest');

        contentService.add(content)
            .then(
                content => commit('addSuccess', content),
                error => commit('addFailure', error)
            );
    },

    update({ commit }, content) {
        commit('updateRequest');

        contentService.update(content)
            .then(
                content => commit('updateSuccess', content),
                error => commit('updateFailure', error)
            );
    },

    list({ commit }, { contentType, filters }) {
        commit('listRequest');

        contentService.list(contentType, filters)
            .then(
                contents => commit('listSuccess', contents),
                error => commit('listFailure', error)
            );
    },

    delete({ commit }, values) {
        commit('deleteRequest', values);

        contentService.delete(values)
            .then(
                values => commit('deleteSuccess', values),
                error => commit('deleteSuccess', { values, error: error.toString() })
            );
    }
};

const mutations = {

    getRequest(state) {
        state.loadedContent = { loading: true };
    },
    getSuccess(state, content) {
        state.loadedContent = content;
    },
    getFailure(state, error) {
        state.loadedContent = { error };
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
        state.updated = { loading: true };
    },
    updateSuccess(state) {
        state.updated = { done: true };
    },
    updateFailure(state, error) {
        state.updated = { error };
    },
    listRequest(state) {
        state.list = { loading: true };
    },
    listSuccess(state, contents) {
        state.list = { items: contents.Items };
        state.next = contents.LastEvaluatedKey;
    },
    listFailure(state, error) {
        state.list = { error };
    },
    deleteRequest(state, values) {
        // add 'deleting:true' property to user being deleted
        state.list.items = state.list.items.map(content =>
            content.id === values.id
                ? { ...content, deleting: true }
                : content
        )
    },
    deleteSuccess(state, values) {
        // remove deleted content from state
        state.list.items = state.list.items.filter(content => content.id !== values.id)
    },
    deleteFailure(state, { values, error }) {
        // remove 'deleting:true' property and add 'deleteError:[error]' property to content
        state.list.items = state.items.map(content => {
            if (content.id === values.id) {
                // make copy of content without 'deleting:true' property
                const { deleting, ...contentCopy } = content;
                // return copy of content with 'deleteError:[error]' property
                return { ...contentCopy, deleteError: error };
            }

            return content;
        })
    }
  };

export const contents = {
    namespaced: true,
    state,
    actions,
    mutations
};
