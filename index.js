const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const path = require("path");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
app.use(express.json());

// create method - POST  /items , body - {id,userName}
app.post("/items", async (req, res) => {
  try {
    const { id, userName } = req.body;
    const params = {
      TableName: "tbl_user",
      Item: {
        id,
        userName,
      },
    };

    await dynamoDb.put(params).promise();
    res
      .status(200)
      .json({ successful: true, message: "User added successfully!" });
  } catch (error) {
    console.error("error creating user:", error);
    res.status(500).json({ error: "error creating user", error });
  }
});

// fetch all items - GET  /items
app.get("/items", async (req, res) => {
  try {
    const params = {
      TableName: "tbl_user",
    };
    const result = await dynamoDb.scan(params).promise();
    res.status(200).json(result.Items);
  } catch (error) {
    console.error("erro getting users:", error);
    res.status(500).json({ error: "error getting users", error });
  }
});

// fetch item by id - GET /items/{id}
app.get("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const params = {
      TableName: "tbl_user",
      Key: {
        id: id,
      },
    };
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      res.status(200).json(result.Item);
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } catch (error) {
    console.error("error getting user:", error);
    res.status(500).json({ error: "error getting user", error });
  }
});

// update method - PUT /items/{id} , body - {userName}
app.put("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userName = req.body.userName;

    const params = {
      TableName: "tbl_user",
      Key: {
        id: id,
      },
      UpdateExpression: "SET userName = :userName",
      ExpressionAttributeValues: {
        ":userName": userName,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(params).promise();
    res.status(200).json(result.Attributes);
  } catch (error) {
    console.error("error updating user:", error);
    res.status(500).json({ error: "error updating user", error });
  }
});

// delete method - DELETE /items/{id}
app.delete("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const params = {
      TableName: "tbl_user",
      Key: {
        id: id,
      },
    };

    await dynamoDb.delete(params).promise();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("error deleting user:", error);
    res.status(500).json({ error: "error deleting user", error });
  }
});

app.get("/", (req, res) => {
  const file_path = path.resolve(__dirname, "index.html");
  console.log(file_path);
  res.status(200).sendFile(file_path);
});

module.exports.handler = serverless(app);
