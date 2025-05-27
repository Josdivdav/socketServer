const admin = require("firebase-admin");
const express = require("express");
const app = express();
const cors = require('cors');
const model = require("./models.json");
const databaseReg = model.databaseReg;
app.use(cors());
const server = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const firebase_string = {
  "type": "service_account",
  "project_id": "lynx2server",
  "private_key_id": model.FIREBASE_P,
  "private_key": model.FIREBASE_API,
  "client_email": "firebase-adminsdk-z7hcn@lynx2server.iam.gserviceaccount.com",
  "client_id": "103135648968215668393",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z7hcn%40lynx2server.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
admin.initializeApp({
  credential: admin.credential.cert(firebase_string),
  databaseURL: "https://lynx2server-default-rtdb.firebaseio.com"
});
const db = admin.database();
//console.log(process.env.FIREBASE_API_KEY)
io.on("connection", (socket) => {
  Database.init(socket);
})
const Database = {
  init: function(socket) {
    this.login(socket);
    this.signup(socket);
    this.peerCall(socket);
    this.addFriend(socket);
    this.fetchUsers(socket);
    this.userDetails(socket);
    this.lastChat(socket);
  },
  login: function(socket) {
    socket.on("login", (userData) => {
      userData = JSON.parse(userData);
      db.ref(`${databaseReg}/accounts`).on("value", (snapshot) => {
        if (snapshot.val()) {
          snapshot = Object.values(snapshot.val());
          snapshot = snapshot.find(res => res.number == userData.number && res.password == userData.password);
          socket.emit("login", (snapshot || {code: 404, message: "No user found!"}));
        } else {
          socket.emit("login", {code: 404, message: "No user found!"});
        }
      })
    })
  },
  signup: function(socket) {
    socket.on("signup", (userData) => {
      const key = db.ref(`${databaseReg}/accounts`).push().key;
      let variables = [];
      userData = JSON.parse(userData);
      userData.uuid = key;
      db.ref(`${databaseReg}/accounts`).once("value", (snapshot) => {
        if(!snapshot.val()) {
          const values = Object.values(userData);
          const keys = Object.keys(userData);
          for(let i = 0; i < values.length; i++){
            if(keys[i] == "photos") console.log("photo")
            db.ref(`${databaseReg}/accounts/${key}`).update({
              [keys[i]]: values[i],
            })
          }
          socket.emit("signup", userData);
        } else {
          snapshot = Object.values(snapshot.val());
          snapshot = snapshot.filter(res => res.number == userData.number);
          if(snapshot.length === 3) {
            socket.emit("signup", {code: 300, message: "Maximum registered number reached"});
          } else {
            const values = Object.values(userData);
            const keys = Object.keys(userData);
            for(let i = 0; i < values.length; i++){
              if(keys[i] == "photos") console.log("photo")
              db.ref(`${databaseReg}/accounts/${key}`).update({
                [keys[i]]: values[i],
              })
            }
            socket.emit("signup", userData);
          }
        }
      })
    })
  },
  peerCall: function(socket) {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
    })
  },
  addFriend: function() {
    
  },
  fetchUsers: function(socket) {
    socket.on("app-list-user", (uuid, number) => {
      db.ref(`${databaseReg}/accounts/${uuid}/recently_chatted`).on("value", (snapshot) => {
        if(!snapshot.val()) {
          socket.emit("app-list-user", {code: 404, message: "No user was found!"});
        } else {
          socket.emit("app-list-user", snapshot.val());
        }
      })
    })
  },
  userDetails: function(socket) {
    socket.on("user_details", (sid) => {
      db.ref(`${databaseReg}/accounts/${sid}`).on("value", (snapshot) => {
        if(!snapshot.val()) {
          socket.emit("user_details", {code: 404, message: "No user was found!"});
        } else {
          socket.emit("user_details", snapshot.val());
        }
      })
    })
  },
  lastChat: function(socket) {
    socket.on("last_chat", (sid) => {
      db.ref(`${databaseReg}/chat_accounts/${sid}`).once("value", (snapshot) => {
        if(!snapshot.val()) {
          socket.emit("last_chat", {code: 404, message: "No data found!"});
        } else {
          socket.emit("last_chat", snapshot.val());
        }
      })
    })
  }
}

server.listen(8000, () => {
 console.log("Sockets are on @ port 8000");
})
