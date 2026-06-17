const mongoose = require("mongoose");

const trackerHistorySchema = new mongoose.Schema({
    device: String,
    deviceName:String,
    location: String,
    receiver: String,
    timestamp: Date
});

module.exports =
    mongoose.model(
        "TrackerHistory",
        trackerHistorySchema
    );