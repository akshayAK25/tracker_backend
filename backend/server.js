const express = require("express");
const cors = require("cors");
const mongo= require("mongoose");
const TrackerHistory =require("./models/TrackerHistory");
const Device = require("./models/Device");
const Antenna = require("./models/Antenna");
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

function getSignalStatus(rssi) {
    if (rssi >= -50) return "Very Near";
    if (rssi >= -65) return "Near";
    if (rssi >= -80) return "Medium";
    return "Far";
}

app.post("/rssi", async (req, res) => {

    const {
        receiver,
        device,
        rssi
    } = req.body;


    const antenna =await Antenna.findOne({antennaId: receiver});
    if (!antenna) {
        return res.status(404).json({
            message: `Unknown antenna ${receiver}`
        });
    }


    const deviceInfo =await Device.findOne({tagId: device});
    if (!deviceInfo) {
        return res.status(404).json({
            message: `Unknown device ${device}`
        });
    }

    const location = antenna.location;
    const deviceName = deviceInfo.deviceName;

    // create tracker if not exists
    if (!trackers[deviceName]) {
        trackers[deviceName] = {
            currentLocation: null,
            bestRSSI: null,
            nearestReceiver: null,
            status: null,
            receivers: {}
        };
        await TrackerHistory.create({
                device,
                location,
                receiver,
                timestamp: new Date()
            });

    }

    // update receiver data
    trackers[deviceName].receivers[receiver] = {
        location,
        rssi,
        timestamp: new Date()
    };

    const previousLocation =trackers[deviceName].currentLocation;        


    // determine strongest signal
    let strongestRSSI = -999;
    let bestReceiver = null;
    let bestLocation = null;

    for (const receiverName in trackers[deviceName].receivers) {

        const receiverData =trackers[deviceName].receivers[receiverName];

        if (receiverData.rssi > strongestRSSI) {
            strongestRSSI = receiverData.rssi;
            bestReceiver = receiverName;
            bestLocation = receiverData.location;
            
        }
    }


    // update processed tracker info
    
    trackers[deviceName].bestRSSI = strongestRSSI;
    trackers[deviceName].nearestReceiver = bestReceiver;
    trackers[deviceName].currentLocation = bestLocation;

    if (previousLocation !== null &&previousLocation !== bestLocation) {
    await TrackerHistory.create({
        device,
        deviceName,
        location: bestLocation,
        receiver: bestReceiver,
        timestamp: new Date()
    });

    console.log(`${device} moved from ${previousLocation} to ${bestLocation}`);
}

    trackers[deviceName].status =getSignalStatus(strongestRSSI);

    console.log("\n=== TRACKERS ===");

    console.dir(trackers, { depth: null });

    res.json({
        success: true
    });
});



app.get("/devices", (req, res) => {

    res.json(trackers);
});



app.get("/history/:device", async (req, res) => {

    const history =
        await TrackerHistory.find({

            device: req.params.device

        })
        .sort({ timestamp: -1 });

    res.json(history);
});


// to update devices------------------

app.post("/device", async (req, res) => {

    // console.log(req);

    const {
        tagId,
        deviceName
    } = req.body;

    const device =
        await Device.findOneAndUpdate({ tagId },{ deviceName },{upsert: true,new: true});
    res.json(device);

});

// update antenna -----------------------------


app.post("/antenna", async (req, res) => {

    const {
        antennaId,
        location
    } = req.body;

    const antenna =
        await Antenna.findOneAndUpdate(
            { antennaId },
            { location },
            {
                upsert: true,
                new: true
            }
        );

    res.json(antenna);
});



// alll devices 
app.get("/devices-map", async (req, res) => {

    const devices =
        await Device.find();

    res.json(devices);
});

// all antennas

app.get("/antennas", async (req, res) => {

    const antennas =
        await Antenna.find();

    res.json(antennas);
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