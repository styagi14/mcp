import { Router } from "express";
import { getProducts, getProductById, createProduct } from "../controller/product.controller.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema } from "../schema/product.schema.js";

const router = Router();
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", validate(createProductSchema), createProduct);

export default router;
