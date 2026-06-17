require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRouter = require("./routes/payment");

const app = express();

// Trust proxy (ngrok, reverse proxy...)
app.set("trust proxy", 1);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

// API Routes
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/rooms", roomRoutes);
app.use("/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payment", paymentRouter);

// Angular build path
const frontendPath = path.join(__dirname, "../frontend/dist/frontend/browser");

app.use(express.static(frontendPath));

// API prefixes (không redirect sang Angular)
const apiPrefixes = [
  "/auth",
  "/bookings",
  "/rooms",
  "/customers",
  "/api/auth",
  "/api/bookings",
  "/api/rooms",
  "/api/customers",
  "/api/payment",
  "/api/reports",
];

// SPA fallback
app.use((req, res, next) => {
  console.log(">>> MIDDLEWARE path:", req.path, "| method:", req.method);

  if (req.method !== "GET") {
    return next();
  }

  const isApiRequest = apiPrefixes.some((prefix) =>
    req.path.startsWith(prefix),
  );

  if (isApiRequest) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
