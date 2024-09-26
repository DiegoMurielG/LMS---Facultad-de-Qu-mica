const mongoose = require("mongoose");

const ContentSchema = mongoose.Schema({
  // question_id: {
  //   type: String,
  //   required: true,
  // },
  contentType: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  pictures: [
    {
      name: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
    },
  ],
});

const ContentModel = mongoose.model("contenidos", ContentSchema);
module.exports = ContentModel;
