"use client";

import { useState } from "react";
import { KeyRound, Lock, ArrowRight } from "lucide-react";

interface ClientLoginProps {
  clientName: string;
  correctPassword?: string;
  onSuccess: () => void;
}

export default function ClientLogin({ clientName, correctPassword, onSuccess }: ClientLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the entered password matches the one in the database
    if (password === correctPassword) {
      setError("");
      onSuccess(); // Triggers the dashboard to unlock
    } else {
      setError("Incorrect password. Please try again.");
      setPassword(""); // Clear the input on fail
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-6 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />

        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100/50">
          <KeyRound size={28} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Please enter the secure password to access the workspace for <strong className="text-gray-900">{clientName}</strong>.
        </p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="text-left relative">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Dashboard Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..." 
                className={`w-full bg-gray-50 border rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm ${error ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white'}`}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500 font-medium mt-2 absolute -bottom-5 left-1">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg mt-3 flex items-center justify-center gap-2 group"
          >
            Unlock Dashboard
            <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </form>

      </div>
    </div>
  );
}