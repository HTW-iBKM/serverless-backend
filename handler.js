const serverless = require("serverless-http");
const express = require("express");
const app = express();
const csv = require("csvtojson");
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

app.get("/", async (req, res, next) => {
  const response = await S3.listObjectsV2({
    Bucket: 'htwprojectdata',
    Prefix: 'data'
  }).promise();

    let data = {};
    for (const index in response.Contents) {
      let params = { Bucket: 'htwprojectdata', Key: response.Contents[index].Key };
      // get csv file and create stream
      const stream = S3.getObject(params).createReadStream();
      // convert csv file (stream) to JSON format data
      let json = await csv().fromStream(stream);
      json = calculateAggregationAttributes(json);

      let name =  response.Contents[index].Key.replace(/data[/]|.csv|/gi,"");
      let obj= {};

      obj[name] = json;
      Object.assign(data, obj);
    }

  
    return res.status(200).json({
      data
    });
});


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
      const weekday = Math.round(((Number(obj.weekly_sin)+ Number(obj.weekly_cos)) / sumFeature) * 100);
      const sun = Math.round(((Number(obj.forecast_2['0_globalstrahlung']) +  Number(obj.forecast_2['0_temp'])) / sumFeature) * 100);
      const pressure = Math.round((Number(obj.forecast_2['0_pressure']) / sumFeature) * 100);

      return {...obj, sumFeature, day_hour, weekday, sun, pressure}
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
