import express from "express";
import productRoutes from "./routes/product.routes.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.use('/api', productRoutes);

export default app;

