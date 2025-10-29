const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const KeepAlive = require("./utils/keepAlive");
const algorithmRoutes = require("./routes/algorithm.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const proposalRoutes = require("./routes/proposal.routes");
const commentRoutes = require("./routes/comment.routes");
const notificationRoutes = require("./routes/notification.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const communityRoutes = require("./routes/community.routes");
const dataStructureRoutes = require("./routes/dataStructure.routes");
const dataStructureProposalRoutes = require("./routes/dataStructureProposal.routes");
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require("./routes/contact.routes");

const { notFound, errorHandler } = require("./middleware/error.middleware");

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/algorithms", algorithmRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/data-structures", dataStructureRoutes);
app.use("/api/data-structure-proposals", dataStructureProposalRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/contact", contactRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  const keepAlive = new KeepAlive();
  setTimeout(() => keepAlive.start(), 10000);
});