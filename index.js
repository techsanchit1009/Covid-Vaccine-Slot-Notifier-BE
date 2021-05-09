const express = require('express');
const http = require('http');
const app = express();
require('dotenv').config();
const httpServer = http.createServer(app);
const bodyParser = require('body-parser');
const cron = require('node-cron');
const helper = require('./helper');

const availablePincodes = ['110095', '110092', '110040'];
const selectedAgeGroup = [18, 45];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, HEAD, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "*"
  );
  next();
});

app.use(bodyParser.json())

app.get("/api", async (req, res) => {
  try {
    availablePincodes.forEach(pincode => {
      selectedAgeGroup.forEach(async (minAge) => {
        await helper.checkAvailability(pincode, minAge);
      } )
    });
    res.send({data: 'Messages sent'});
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/add-pincode", (req, res) => {
  if (!availablePincodes.includes(req.body.pincode)) {
    availablePincodes.push(req.body.pincode);
  }
  res.send({pincodes: availablePincodes});
});

// runs every 10 minutes
cron.schedule(process.env.CRON_CONFIG, async () => {
  console.log('CRON EXECUTED');
  try {
    availablePincodes.forEach(pincode => {
      selectedAgeGroup.forEach(async (minAge) => {
        await helper.checkAvailability(pincode, minAge);
      })
    });
  } catch(err) {
    console.log('Error in Scheduler', err);
  }
});

httpServer.listen(process.env.PORT || 8080, () => {
  console.log("Server running at", process.env.PORT || 8080);
});