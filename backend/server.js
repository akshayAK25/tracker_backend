const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let latestData = {};

app.post("/rssi", (req, res) => {

    const { receiver, device, rssi } = req.body;

    latestData[device] = {
        receiver,
        rssi,
        timestamp: new Date()
    };

    console.log("\n--- DATA RECEIVED ---");
    console.log(latestData);

    res.json({
        success: true
    });
});

app.get("/devices", (req, res) => {
    res.json(latestData);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});