const mongoose = require("mongoose");

const trackerHistorySchema = new mongoose.Schema({

    device: String,

    location: String,

    receiver: String,

    timestamp: Date

});

module.exports =
    mongoose.model(
        "TrackerHistory",
        trackerHistorySchema
    );