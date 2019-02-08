import { contentService } from '../_services';

const state = {
    list: {},
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

    list({ commit }, contentType) {
        commit('listRequest');

        contentService.list(contentType)
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

    addRequest(state) {
        state.added = { loading: true };
    },
    addSuccess(state) {
        state.added = { done: true };
    },
    addFailure(state, error) {
        state.added = { error };
    },
    listRequest(state) {
        state.list = { loading: true };
    },
    listSuccess(state, contents) {
        state.list = { items: contents };
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
