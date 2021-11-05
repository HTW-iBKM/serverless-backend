const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require('aws-sdk');
const S3= new AWS.S3();

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello world",
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
