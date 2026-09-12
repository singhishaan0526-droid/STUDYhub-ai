const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB — server will start anyway:', err.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();

