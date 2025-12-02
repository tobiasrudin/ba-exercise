// Run with: node server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public")); // serves index.html and assets

// Shared global layout
let layout = {
  background: null,
  items: [] // { id, src, left, top, width, locked }
};

io.on("connection", socket => {
  socket.emit("initial_state", layout);

  socket.on("add_images", imgs => {
    imgs.forEach(i => layout.items.push(i));
    socket.broadcast.emit("images_added", imgs);
  });

  socket.on("move_image", data => {
    const item = layout.items.find(i => i.id === data.id);
    if (item) {
      item.left = data.left;
      item.top = data.top;
    }
    socket.broadcast.emit("image_moved", data);
  });

  socket.on("delete_image", id => {
    layout.items = layout.items.filter(i => i.id !== id);
    socket.broadcast.emit("image_deleted", id);
  });

  socket.on('set_background', dataUrl =>{
    stage.style.backgroundImage = `url(${dataUrl})`;
  });

  socket.on("clear_all", () => {
    layout.items = [];
    io.emit("all_cleared");
  });
});

// IMPORTANT: Render requires dynamic PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
