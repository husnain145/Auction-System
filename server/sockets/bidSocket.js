module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected to socket:', socket.id);

    // Placeholder for future bid events
    socket.on('test', (data) => {
      console.log('Received test data:', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};
