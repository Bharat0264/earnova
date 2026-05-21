import User from "../models/User.js"; import Product from "../models/Product.js"; import Service from "../models/Service.js";
export const dashboardStats=async(req,res)=>{const [users,products,services]=await Promise.all([User.countDocuments(),Product.countDocuments(),Service.countDocuments()]);res.json({success:true,stats:{users,products,services}});};
export const getUsers=async(req,res)=>{const users=await User.find().select("-password").sort({createdAt:-1});res.json({success:true,users});};
export const blockUser=async(req,res)=>{const user=await User.findByIdAndUpdate(req.params.id,{isBlocked:true},{new:true}).select("-password");res.json({success:true,user});};
export const removeListing=async(req,res)=>{const Model=req.params.type==="service"?Service:Product; await Model.findByIdAndUpdate(req.params.id,{isActive:false});res.json({success:true,message:"Listing removed"});};
