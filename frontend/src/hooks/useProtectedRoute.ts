"use client";
import { useRouter } from "next/navigation"; import { useEffect } from "react"; import { useAuth } from "@/context/AuthContext";
export function useProtectedRoute(adminOnly=false){const {user,loading}=useAuth(); const router=useRouter(); useEffect(()=>{if(loading) return; if(!user) {router.push("/login"); return;} if(adminOnly&&user.role!=="admin") router.push("/dashboard");},[user,loading,adminOnly,router]); return {user,loading};}
