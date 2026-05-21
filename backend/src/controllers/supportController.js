import SupportTicket from "../models/SupportTicket.js";
export const createTicket=async(req,res)=>{const ticket=await SupportTicket.create({...req.body,user:req.user._id});res.status(201).json({success:true,ticket});};
export const myTickets=async(req,res)=>{const tickets=await SupportTicket.find({user:req.user._id}).sort({createdAt:-1});res.json({success:true,tickets});};
export const adminTickets=async(req,res)=>{const tickets=await SupportTicket.find().populate("user","name email").sort({createdAt:-1});res.json({success:true,tickets});};
export const replyTicket=async(req,res)=>{const {id}=req.params; const {adminReply,status}=req.body; const ticket=await SupportTicket.findByIdAndUpdate(id,{adminReply,status:status||"in_progress"},{new:true});res.json({success:true,ticket});};
