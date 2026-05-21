import mongoose from "mongoose";
const serviceSchema=new mongoose.Schema({title:{type:String,required:true},description:{type:String,required:true},category:{type:String,enum:["Electronics","Solar Panels","Design","Development","Video Editing"],required:true},startingPrice:{type:Number,required:true},deliveryDays:{type:Number,default:3},seller:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},ratingAverage:{type:Number,default:0},totalReviews:{type:Number,default:0},isActive:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model("Service",serviceSchema);
