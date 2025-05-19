const admin = require("firebase-admin");
const express = require("express");
const app = express();
const cors = require('cors');
app.use(cors());
const server = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const serviceAccount = require("./cert.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lynx2server-default-rtdb.firebaseio.com"
});
/*admin.initializeApp({
  databaseURL: "http://localhost:9000?ns=livetypings"
});*/

const db = admin.database();

io.on("connection", (socket) => {
  socket.on("data", (data) => {
   socket.emit("data", data);
   const key = db.ref("/").push().key; 
   db.ref("/").set({[key]: data});
  })
  db.ref("/").on("value", (s) => socket.emit("se", s.val()));
})

server.listen(3030, () => {
 console.log("Database are on @ port 3030");
})
