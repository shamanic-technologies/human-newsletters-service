import express from "express";
import cors from "cors";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { requireHeaders } from "./middleware/required-headers.js";
import healthRoutes from "./routes/health.js";
import newsletterRoutes from "./routes/newsletters.js";
import { db } from "./db/index.js";

const app = express();
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(express.json());
app.use(requireHeaders);

app.use(healthRoutes);
app.use(newsletterRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (process.env.NODE_ENV !== "test") {
  migrate(db, { migrationsFolder: "./drizzle" })
    .then(() => {
      console.log("Migrations complete");
      app.listen(Number(PORT), "::", () => {
        console.log(`Human newsletters service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

export default app;
