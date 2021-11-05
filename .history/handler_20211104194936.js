const serverless = require("serverless-http");
const express = require("express");
const app = express();
const csv = require("csvtojson");
const AWS = require('aws-sdk');
const S3= new AWS.S3();

app.get("/", async (req, res, next) => {
  let returnObj = {};
  const response = await S3.listObjectsV2({
    Bucket: 'htwprojectdata',
    Prefix: 'data'
  }).promise();


  for (const index in response.Contents) {
    console.log("obj ist:" + obj);
    console.log("key ist"+ obj.Key);
    let params = {Bucket: 'htwprojectdata', Key: response.Contents[îndex].Key};
    csv()
    .fromStream(S3.getObject(params).createReadStream())
    .subscribe(function(jsonObj){ 
       return new Promise(function(resolve,reject){
          returnObj += jsonObj;
          resolve();
       })
    }) 
  }

  return res.status(200).json({
    jsonObj
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
