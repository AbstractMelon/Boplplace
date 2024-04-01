// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { saveCanvasState, backupCanvasState, loadCanvasState } = require('./management');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

// Maintain the state of the canvas
let canvasState = loadCanvasState() || {
    images: [
      { id: 1, x: 100, y: 100, imageUrl: 'https://via.placeholder.com/150' },
      { id: 2, x: 200, y: 200, imageUrl: 'https://via.placeholder.com/150' },
      { id: 3, x: 300, y: 300, imageUrl: 'https://via.placeholder.com/150' }
    ]
  };

// Send Canvas State
function broadcastCanvasState() {
  io.emit('canvasState', canvasState);
  saveCanvasState(canvasState);
  console.log("Broadcasting Canvas State to all clients");
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('canvasState', canvasState);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  socket.on('placeImage', (newImage) => {
    canvasState.images.push(newImage);

    console.log("New Image placed on the canvas:", newImage);
    broadcastCanvasState();
  });

  socket.on('moveImage', (updatedImage) => {
    const imageIndex = canvasState.images.findIndex((img) => img.id === updatedImage.id);
    if (imageIndex !== -1) {
      canvasState.images[imageIndex].x = updatedImage.x;
      canvasState.images[imageIndex].y = updatedImage.y;
      broadcastCanvasState();
      console.log("Image moved on the canvas:", updatedImage);
    }
  });

  // Removing Images
  socket.on('removeImage', (imageIdToRemove) => {
    canvasState.images = canvasState.images.filter((img) => img.id !== imageIdToRemove);
    // Broadcast canvas state to all clients
    broadcastCanvasState();
    console.log("Image removed from the canvas:", imageIdToRemove);
  });
});

setInterval(() => backupCanvasState(canvasState), 60 * 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
