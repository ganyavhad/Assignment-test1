const express = require("express");
const app = express();
const path = require("path");

// midleware for parsing data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
  res.sendFile("index.html");
});

app.listen(5000, () => {
  console.log("Listening on 5000");
});
