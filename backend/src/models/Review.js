import mongoose from "mongoose";
const reviewSchema=new mongoose.Schema({reviewer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},targetUser:{type:mongoose.Schema.Types.ObjectId,ref:"User"},listingType:{type:String,enum:["product","service"],required:true},listingId:{type:mongoose.Schema.Types.ObjectId,required:true},rating:{type:Number,min:1,max:5,required:true},comment:{type:String,default:""}},{timestamps:true});
export default mongoose.model("Review",reviewSchema);
