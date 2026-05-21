import express from "express";

import {
  createProduct,
  getProducts,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/", getProducts);

// Protected Route
router.post("/", protect, createProduct);

export default router;