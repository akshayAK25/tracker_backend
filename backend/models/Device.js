const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({

    tagId: {
        type: String,
        required: true,
        unique: true
    },

    deviceName: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model(
    "Device",
    deviceSchema
);