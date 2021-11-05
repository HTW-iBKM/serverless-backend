const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require('aws-sdk');

app.get("/", (req, res, next) => {

  S3.getObject({Bucket: '*******', Key: '******'}).promise().then( data =>{
    return {
      statusCode: 200,
      body: data
  }})
  
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
