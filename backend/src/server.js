const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
