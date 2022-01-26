const serverless = require("serverless-http");
const express = require("express");
const app = express();
const csv = require("csvtojson");
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

app.get("/", async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  //
  // const response = await S3.listObjectsV2({
  //   Bucket: 'htwprojectdata',
  //   Prefix: 'data'
  // }).promise();


  // console.log(response)
  let stream = S3.getObject({ Bucket: 'ibkm-htw-data', Key: 'explainer_normalized_target.csv' }).createReadStream();
  let data = await csv().fromStream(stream);
  data = transformData(data);
  console.log(data.length);

  // for (const index in response.Contents) {
  //   let params = { Bucket: 'htwprojectdata', Key: response.Contents[index].Key };
  //   // get csv file and create stream
  //   const stream = S3.getObject(params).createReadStream();
  //   // convert csv file (stream) to JSON format data
  //   let json = await csv().fromStream(stream);
  //   json = calculateAggregationAttributes(json);

  //   let name =  response.Contents[index].Key.replace(/data[/]|.csv|/gi,"");
  //   let obj= {};

  //   obj[name] = json;
  //   Object.assign(data, obj);
  // }

  // console.log(data);
  return res.json(data)
});


function transformData(data) {
  return data.sort((a, b) => {
    const firstDate = new Date(a.berlin_time);
    const secondDate = new Date(b.berlin_time);
    if (firstDate < secondDate) {
      return -1;
    } else if (firstDate > secondDate) {
      return 1;
    }
    return 0;
  }).map((single => {
    single['time'] = single['berlin_time']
    // console.log(single)
    // delete single['berlin_time'];
    // const date = new Date(single['time']);
    // const monthNames = ["January", "February", "March", "April", "May", "June",
    //     "July", "August", "September", "October", "November", "December"
    // ].map((item) => item.toLowerCase());
    // const month_andday = `${monthNames[date.getMonth()]}${date.getDate() + 1}`;
    // if (!customObj[month_and_day]) customObj[month_and_day] = [];
    // customObj[month_and_day].push(single as unknown as GraphData);
    return single;
  }));
}


function calculateAggregationAttributes(json) {

  return json.map(obj => {
    const sumFeature = Math.abs(obj.daily_cos)
        + Math.abs(obj.forecast_2['0_globalstrahlung'])
        + Math.abs(obj.forecast_2['0_temp'])
        + Math.abs(obj.forecast_2['0_pressure'])
        + Math.abs(obj.daily_sin)
        + Math.abs(obj.weekly_sin)
        + Math.abs(obj.weekly_cos);
    const day_hour = Math.round(((Number(obj.daily_cos) + Number(obj.daily_sin)) / sumFeature) * 100);
    const weekday = Math.round(((Number(obj.weekly_sin) + Number(obj.weekly_cos)) / sumFeature) * 100);
    const sun = Math.round(((Number(obj.forecast_2['0_globalstrahlung']) + Number(obj.forecast_2['0_temp'])) / sumFeature) * 100);
    const pressure = Math.round((Number(obj.forecast_2['0_pressure']) / sumFeature) * 100);

    return { ...obj, sumFeature, day_hour, weekday, sun, pressure }
  });
}


app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);