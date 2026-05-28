import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

// Host the entire frontend folder statically
app.use("/frontend", express.static(path.join(process.cwd(), "frontend")));

// Redirect the root to the index.html page
app.get("/", (req, res) => {
  res.redirect("/frontend/pages/index.html");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AfyaChain Development Server running on Port ${PORT}`);
});
