<template>
  <div>
    <div class="uploadResults"></div>
    <div class="file-upload-form">
      Upload an image file:
      <input
        type="file"
        accept="image/*"
        @change="previewImage"
      >
    </div>
    <div
      v-if="imageData.length > 0"
      class="image-preview"
    >
      <img
        class="preview"
        :src="imageData"
      >
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import {uploadService} from '../_services/upload.service';

export default {
  data: function() {
    return {
      imageData: '' // we will store base64 format of image in this string
    };
  },
  computed: {
    ...mapState({
      me: state => state.users.me,
    })
  },
  created() {
    this.getMe();
  },
  methods: {
    ...mapActions("users", {
      getMe: "getMe",
    }),
    previewImage: function(event) {
      // Reference to the DOM input element
      var input = event.target;
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = (e) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.imageData = e.target.result;
          uploadService.sendFile(e.target.result, input.files[0].name)
            .then((result) => {
              this.$store.dispatch('alert/success', "Image uploaded");
            })
            .catch((err) => {
              this.$store.dispatch('alert/error', err.message);
            });
        };
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0]);
      }
    }
  }
};
</script>
