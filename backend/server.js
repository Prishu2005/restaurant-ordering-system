const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const sequelize = require("./db");

// Import models to ensure associations are registered
require("./models/Restaurant");
require("./models/MenuItem");
require("./models/Order");

// Import routes
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://restaurantqrcode.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// Socket.IO handlers
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join_table_room", (tableNumber) => {
    if (tableNumber) {
      socket.join(`table_${tableNumber}`);
      console.log(`Socket ${socket.id} joined table_${tableNumber}`);
    }
  });

  socket.on("call_waiter", ({ tableNumber, restaurantId }) => {
    console.log(`🔔 Waiter called at Table ${tableNumber}`);
    io.emit("waiter_called", { tableNumber, restaurantId });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Database sync then start server
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ MySQL connected and tables synced");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MySQL connection error:", err));
