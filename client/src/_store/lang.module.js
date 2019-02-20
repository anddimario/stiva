let state = {
  curLanguage: null,
  languages: [
    {
      short: 'en',
      long: 'English'
    },
    {
      short: 'it',
      long: 'Italiano'
    }
  ]
};

state.curLanguage = state.languages[0];

const mutations = {
  setLanguage(state, lang) {
    state.curLanguage = lang;
  }
}

export const lang = {
  state,
  mutations
};
