import express from "express"; import { createService,getServices } from "../controllers/serviceController.js"; import { protect } from "../middleware/authMiddleware.js";
const r=express.Router(); r.get("/",getServices); r.post("/",protect,createService); export default r;
