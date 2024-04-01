// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

// Maintain the state of the canvas
let canvasState = {
    images: [
      { id: 1, x: 100, y: 100, imageUrl: 'https://via.placeholder.com/150' },
      { id: 2, x: 200, y: 200, imageUrl: 'https://via.placeholder.com/150' },
      { id: 3, x: 300, y: 300, imageUrl: 'https://via.placeholder.com/150' }
    ]
  };
  
// Function to broadcast canvas state to all clients
function broadcastCanvasState() {
  io.emit('canvasState', canvasState);
}

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send the current canvas state to the newly connected client
  socket.emit('canvasState', canvasState);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle placing a new image on the canvas
  socket.on('placeImage', (newImage) => {
    // Add the new image to the canvas state
    canvasState.images.push(newImage);
    // Broadcast the updated canvas state to all clients
    broadcastCanvasState();
  });

  // Handle moving an existing image on the canvas
  socket.on('moveImage', (updatedImage) => {
    // Find the image in the canvas state and update its position
    const imageIndex = canvasState.images.findIndex((img) => img.id === updatedImage.id);
    if (imageIndex !== -1) {
      canvasState.images[imageIndex].x = updatedImage.x;
      canvasState.images[imageIndex].y = updatedImage.y;
      // Broadcast the updated canvas state to all clients
      broadcastCanvasState();
    }
  });

  // Handle removing an image from the canvas
  socket.on('removeImage', (imageIdToRemove) => {
    // Filter out the image to remove from the canvas state
    canvasState.images = canvasState.images.filter((img) => img.id !== imageIdToRemove);
    // Broadcast the updated canvas state to all clients
    broadcastCanvasState();
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
