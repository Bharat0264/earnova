import Review from "../models/Review.js";
export const addReview=async(req,res)=>{const review=await Review.create({...req.body,reviewer:req.user._id});res.status(201).json({success:true,review});};
export const getReviews=async(req,res)=>{const {listingId,listingType}=req.query;const reviews=await Review.find({listingId,listingType}).populate("reviewer","name");res.json({success:true,reviews});};
