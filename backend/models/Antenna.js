const mongoose = require("mongoose");

const antennaSchema = new mongoose.Schema({

    antennaId: {
        type: String,
        required: true,
        unique: true
    },

    location: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model(
    "Antenna",
    antennaSchema
);