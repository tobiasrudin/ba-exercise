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

// Store the current board state
let layout = {
  background: null,  // background as data URL
  items: []          // array of image objects {id, src, left, top, width, locked}
};

io.on('connection', socket => {
  // Send full current state to new client
  socket.emit('initial_state', layout);

  // Add images
  socket.on('add_images', imgs => {
    layout.items.push(...imgs);
    socket.broadcast.emit('images_added', imgs);
  });

  // Move image
  socket.on('move_image', data => {
    const img = layout.items.find(i => i.id === data.id);
    if(img){
      img.left = data.left;
      img.top = data.top;
    }
    socket.broadcast.emit('image_moved', data);
  });

  // Set background
  socket.on('set_background', dataUrl => {
    layout.background = dataUrl;      // store once
    socket.broadcast.emit('background_set', dataUrl);
  });

  // Clear all
  socket.on('clear_all', () => {
    layout.items = [];
    layout.background = null;
    socket.broadcast.emit('all_cleared');
  });
});

// IMPORTANT: Render requires dynamic PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
