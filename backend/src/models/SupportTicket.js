import mongoose from "mongoose";
const supportTicketSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},subject:{type:String,required:true},message:{type:String,required:true},status:{type:String,enum:["open","in_progress","resolved"],default:"open"},adminReply:{type:String,default:""}},{timestamps:true});
export default mongoose.model("SupportTicket",supportTicketSchema);
