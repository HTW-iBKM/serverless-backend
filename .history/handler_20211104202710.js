const serverless = require("serverless-http");
const express = require("express");
const app = express();
const csv = require("csvtojson");
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

app.get("/", async (req, res, next) => {
  let returnObj = [];
  const response = await S3.listObjectsV2({
    Bucket: 'htwprojectdata',
    Prefix: 'data'
  }).promise();

  console.log(response);

  for (const index in response.Contents) {

    returnObj.push(
      new Promise((resolve) => {
        const rows = [];
        let params = { Bucket: 'htwprojectdata', Key: response.Contents[index].Key };
        csv()
          .fromStream(S3.getObject(params).createReadStream())
          .subscribe(
            (json) => {
              rows.push(json);
            },
            () => {
              reject();
            },
            () => {
              resolve(rows);
            }
          );
      })
    );

  }

  Promise.all(returnObj).then(() => {
    return res.status(200).json({
      returnObj
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
