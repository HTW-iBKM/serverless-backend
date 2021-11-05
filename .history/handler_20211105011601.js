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


  let returnObj = async function () {
    let obj = {};
    for (const index in response.Contents) {

      let params = { Bucket: 'htwprojectdata', Key: response.Contents[index].Key };
      // get csv file and create stream
      const stream = S3.getObject(params).createReadStream();
      // convert csv file (stream) to JSON format data
      const json = await csv().fromStream(stream);
      console.log(json);
      obj += json;
    }
    return obj;
  }

  Promise.all([returnObj]).then(([result]) => {
    return res.status(200).json({
      result
    });
  });

});


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
