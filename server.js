const admin = require("firebase-admin");
const express = require("express");
const app = express();
const cors = require('cors');
const databaseReg = "/treatmessages";
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
  "private_key_id": "4a2e2829be71bc2cd9f4eaff082eac4f58effd27",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3O9gEIM9T9SJb\nHwK/8Y+Kl0+zOSUheCtzHkqPNiAG1U+at0IF8gjgvGk42aZ78RisxKE+Odz3LZQz\n+FwinehSTE2QGl2iSXIMyIqcEJQoXmnD3YSn4hGcxba/Y3Rw6YybNlnXsUAfcFJ7\n0zY+QSrh8TGt6H+V7swwAovskc65MU2MC/cURV4y6JRtKxpEcCbmvP0lK1RQPSkV\nioZiMAS+EW4iHNslw1Tyg9JvQbH6eFxMbyPxlQVK4VAL/1wtdYhns+NmuCqeXVSg\nrZGcKRBwAOVaWxm5lv45BbjIdH8+2Ba9f1fEcXEFZqzSIr8LvygHrnST7GiE3f0w\nhWsoIo+TAgMBAAECggEAEMzq5I4BlIgga0xvmxvR9nojM6KktennyflYCsOCsj2y\nu9PbuOHVUI3V9AF401pq0cSBqEvz57IFKbK29/GUkJ8waWsRdMTZMTTeCKs4em8V\nsYDJHf+Lb91tASVkUsoHO2ADYtR8taU92t6l1ZVyEh9kV7a+pAeuLyS8oadI1g/4\nbbLo235JHL40Z8wjYfqVpaUSB5o2U4CSXar19tOLLYcdlGrpuy7VqXZbRgtuMkbt\nmWgskbOtDuC0eBUtqZQ9rz6Kolw2z3xuIgqiNnTsUaY/H9bXNLrGP9uW6pVfLcs7\nen8c/xxctlyqvoch+eeGXOOLunEobye1efq0Xo5VeQKBgQDlGOj8j2Jor84cxoEM\nQ2SrQlE0YuQ1HYguour5P9tB4X8bx5vt9ZtHwmUE3TuZw8ULkYy466DulRyLWKiZ\niW4REkNRgm2GEbNR6clYAFOMduiRh0VAGXQv1zOz06oEBpu1nH0Ryyh9B9Na1tGD\nLUw9hfF2DfDnWT+PN+I2/tpkZwKBgQDMwDDNAI5oy0JLbeTsjlEniN58Fn5AvRXH\nBBkHB5j30FUDASUGqRTjCos9AIxIc9SCF6Pru0KojuzM2MJX2I//LFxsiIgcfTBl\nXMEGOdeHBBrkq5gVtrdc5230gRHO+Dqe/+yGYS2GQe/OaoQJmJoDlQqMLZYoal3c\nBwePnkgf9QKBgQDWaXHkre1UPPWSSNYOPCTDg9WsScF7VKBXxXJUxEbYacsknLR7\nCRrDFlSlMMjPKEIKibZCe4SqxjNo1xk0WUMCBy2p43/NslM5nqwqCGQpWkBfs1JE\no43yGF7zNm4wRl8EoekL9i92lRRiOBrtwj9QdUN/UZzdaNHroEm/XtXWkQKBgBjP\n+Zn+RUPBzgjiCmn4XTFTTtLuzuH9iBQUFQxbCViOsJ6qltgVyWgyMOl1lYp6LviM\n8NpyWQOgPmYcpoCKx/h+YbztVsFNEn5WHTYp8Ep2XuPzP3zyJYpmqVaGBah1QHVg\nQkOOpzur5em30sRu78sbVqniJF5FdZZia7Il1ku5AoGBALinYycFekM6jEl+GYAr\nL86kRPS5R05RLPhx0DGsdZyuf6Nr0A9H/Nli2POpZSju/27CrCPgwf8Egb9YHPfT\nBVjoY/ksatuNm/X3rNUsO+Qd6ytoKHQLOLlAGzMPjXObXatmKlhO4sNr3BFfufvL\nifjRziA0Pr8Mvfpkxgq3xGuo\n-----END PRIVATE KEY-----\n",
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
console.log(db.ref(`${databaseReg}/chat_accounts`).push().key)
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
      db.ref(`${databaseReg}/accounts/${uuid}/recently_chatted`).once("value", (snapshot) => {
        socket.emit("app-list-user", snapshot.val())
      })
    })
  },
  userDetails: function(socket) {
    socket.on("user_details", (sid) => {
      db.ref(`${databaseReg}/accounts/${sid}`).once("value", (snapshot) => {
        socket.emit("user_details", snapshot.val())
      })
    })
  },
  lastChat: function(socket) {
    socket.on("last_chat", (sid) => {
      db.ref(`${databaseReg}/chat_accounts/${sid}`).once("value", (snapshot) => {
        socket.emit("last_chat", snapshot.val())
      })
    })
  }
}

server.listen(8000, () => {
 console.log("Sockets are on @ port 8000");
})