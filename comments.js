// create web server with express
const express = require("express");
const app = express();
// import module to parse body of the request
const bodyParser = require("body-parser");
app.use(bodyParser.json());
// import module to generate unique IDs
const { randomBytes } = require("crypto");
// import module to make requests to event bus
const axios = require("axios");

// create comments object
const commentsByPostId = {};

// create route to get comments for a post
app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// create route to create a comment for a post
app.post("/posts/:id/comments", async (req, res) => {
  // generate random id
  const commentId = randomBytes(4).toString("hex");
  // get content from request body
  const { content } = req.body;
  // get comments for post from comments object
  const comments = commentsByPostId[req.params.id] || [];
  // push new comment into comments array
  comments.push({ id: commentId, content, status: "pending" });
  // add comments array to comments object
  commentsByPostId[req.params.id] = comments;
  // make request to event bus
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });
  // send status code and comments array as response
  res.status(201).send(comments);
});

// create route to handle events from event bus
app.post("/events", async (req, res) => {
  // get type and data from request body
  const { type, data } = req.body;
  // check if type is CommentModerated
  if (type === "CommentModerated") {
    // get id, postId and status from data
    const { id, postId, status, content } = data;
    // get comments for post from comments object
    const comments = commentsByPostId[postId];
    // find comment with id
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    // update status of comment
    comment.status = status;
    // make request
