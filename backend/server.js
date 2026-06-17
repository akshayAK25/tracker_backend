const express = require("express");
const cors = require("cors");
const mongo= require("mongoose");
const TrackerHistory =require("./models/TrackerHistory");
const app = express();

app.use(cors());
app.use(express.json());

mongo.connect("mongodb+srv://akshaypanaganti9395_db_user:ak25082003@cluster0.d6pk7ny.mongodb.net/?appName=Cluster0").then(()=>{
    console.log("db connected");
})
.catch((e)=>{
console.log(e.message);
})
// mongodb+srv://akshaypanaganti9395_db_user:ak25082003@cluster0.d6pk7ny.mongodb.net/?appName=Cluster0
// mongodb+srv://akshaypanaganti9395_db_user:ak25082003@cluster0.d6pk7ny.mongodb.net/?appName=Cluster0
/*
DATA STRUCTURE

{
  tracker1: {
    currentLocation: "Hall",
    bestRSSI: -45,
    nearestReceiver: "Laptop1",
    status: "Very Near",

    receivers: {
      Laptop1: {
        location: "Hall",
        rssi: -45,
        timestamp: "..."
      },

      Laptop2: {
        location: "Bedroom",
        rssi: -70,
        timestamp: "..."
      }
    }
  }
}
*/

let trackers = {};
let previousLocation

function getSignalStatus(rssi) {
    if (rssi >= -50) return "Very Near";
    if (rssi >= -65) return "Near";
    if (rssi >= -80) return "Medium";
    return "Far";
}

app.post("/rssi", (req, res) => {

    const {
        receiver,
        location,
        device,
        rssi
    } = req.body;

    // create tracker if not exists
    if (!trackers[device]) {
        trackers[device] = {
            currentLocation: null,
            bestRSSI: null,
            nearestReceiver: null,
            status: null,
            receivers: {}
        };
        previousLocation =trackers[device].currentLocation;
        TrackerHistory.create({
                device,
                location,
                receiver,
                timestamp: new Date()
            });

    }

    // update receiver data
    trackers[device].receivers[receiver] = {
        location,
        rssi,
        timestamp: new Date()
    };

    // determine strongest signal
    let strongestRSSI = -999;
    let bestReceiver = null;
    let bestLocation = null;

    for (const receiverName in trackers[device].receivers) {

        const receiverData =trackers[device].receivers[receiverName];

        if (receiverData.rssi > strongestRSSI) {
            strongestRSSI = receiverData.rssi;
            bestReceiver = receiverName;
            bestLocation = receiverData.location;

            if (previousLocation &&previousLocation !== bestLocation) 
            {   
                TrackerHistory.create({
                    device,
                    location: bestLocation,
                    receiver: bestReceiver,
                    timestamp: new Date()
                });

                console.log(
                    `${device} moved from ${previousLocation} to ${bestLocation}`
                );
            }
        }
    }

    // update processed tracker info
    
    trackers[device].bestRSSI = strongestRSSI;
    trackers[device].nearestReceiver = bestReceiver;
    trackers[device].currentLocation = bestLocation;
    trackers[device].status =getSignalStatus(strongestRSSI);

    console.log("\n=== TRACKERS ===");

    console.dir(trackers, { depth: null });

    res.json({
        success: true
    });
});



app.get("/devices", (req, res) => {

    res.json(trackers);
});

app.listen(3000, () => {

    console.log("Server running on port 3000");
});








//  old og ----------------------------------------

// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// let latestData = {};

// app.post("/rssi", (req, res) => {

//     const { receiver, device, rssi } = req.body;

//     latestData[device] = {
//         receiver,
//         rssi,
//         timestamp: new Date()
//     };

//     console.log("\n--- DATA RECEIVED ---");
//     console.log(latestData);

//     res.json({
//         success: true
//     });
// });

// app.get("/devices", (req, res) => {
//     res.json(latestData);
// });

// app.listen(3000, () => {
//     console.log("Server running on port 3000");
// });