"use client";
import "./globals.css"; import Navbar from "@/components/Navbar"; import { AuthProvider } from "@/context/AuthContext";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthProvider><Navbar/><main className="mx-auto max-w-7xl px-4 py-8">{children}</main></AuthProvider></body></html>;}
