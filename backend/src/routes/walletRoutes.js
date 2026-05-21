import express from "express"; import { getWallet,requestWithdrawal } from "../controllers/walletController.js"; import { protect } from "../middleware/authMiddleware.js";
const r=express.Router(); r.get("/",protect,getWallet); r.post("/withdraw",protect,requestWithdrawal); export default r;
