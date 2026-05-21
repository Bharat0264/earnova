"use client";
import api from "@/services/api";
export async function createRazorpayOrder(amount:number){const {data}=await api.post("/payments/create-order",{amount}); return data;}
export async function verifyRazorpayPayment(payload:{razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string;}){const {data}=await api.post("/payments/verify",payload); return data;}
