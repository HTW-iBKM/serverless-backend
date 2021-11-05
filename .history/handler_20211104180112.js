const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require('aws-sdk');
const S3= new AWS.S3();

app.get("/", (req, res, next) => {

  try {
    console.log(`Hi from Node.js ${process.version} on Lambda!`);
    // Converted it to async/await syntax just to simplify.
    const data = await S3.getObject().promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }
  catch (err) {
    return {
      statusCode: err.statusCode || 400,
      body: err.message || JSON.stringify(err.message)
    }
  }
  
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
