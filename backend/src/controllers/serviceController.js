import Service from "../models/Service.js";
export const createService=async(req,res)=>{const service=await Service.create({...req.body,seller:req.user._id});res.status(201).json({success:true,service});};
export const getServices=async(req,res)=>{const {q,category}=req.query;const f={isActive:true};if(q)f.title={$regex:q,$options:"i"};if(category)f.category=category;const services=await Service.find(f).populate("seller","name email").sort({createdAt:-1});res.json({success:true,services});};
