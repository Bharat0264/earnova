import express from "express"; import { addReview,getReviews } from "../controllers/reviewController.js"; import { protect } from "../middleware/authMiddleware.js";
const r=express.Router(); r.get("/",getReviews); r.post("/",protect,addReview); export default r;
