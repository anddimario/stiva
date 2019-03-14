import { uploadService } from '../_services';

const state = {
  list: {},
};

const actions = {

  list({ commit }) {
    commit('listRequest');

    uploadService.list()
      .then(
        uploads => commit('listSuccess', uploads),
        error => commit('listFailure', error)
      );
  },

  delete({ commit }, key) {
    console.log(key);
    commit('deleteRequest', key);

    uploadService.delete(key)
      .then(
        key => commit('deleteSuccess', key),
        error => commit('deleteSuccess', { key, error: error.toString() })
      );
  }
};


const mutations = {
  listRequest(state) {
    state.list = { loading: true };
  },
  listSuccess(state, uploads) {
    state.list = uploads.files;
  },
  listFailure(state, error) {
    state.list = { error };
  },

  deleteRequest(state, values) {
    // add 'deleting:true' property to user being deleted
    state.list.Contents = state.list.Contents.map(content =>
      content.id === values.Key
        ? { ...content, deleting: true }
        : content
    );
  },
  deleteSuccess(state, values) {
    // remove deleted content from state
    state.list.Contents = state.list.Contents.filter(content => content.Key !== values.Key);
  },
  deleteFailure(state, { values, error }) {
    // remove 'deleting:true' property and add 'deleteError:[error]' property to content
    state.list.Contents = state.list.Content.map(content => {
      if (content.Key === values.Key) {
        // make copy of content without 'deleting:true' property
        const { deleting, ...contentCopy } = content;
        // return copy of content with 'deleteError:[error]' property
        return { ...contentCopy, deleteError: error };
      }

      return content;
    });
  }
};

export const uploads = {
  namespaced: true,
  state,
  actions,
  mutations
};
