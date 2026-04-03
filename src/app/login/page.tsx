"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Coffee, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email.trim(), password);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-container/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container/10 mb-4">
            <Coffee size={32} className="text-primary-container" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-primary-container tracking-tight">
            Cof fi
          </h1>
          <p className="text-secondary text-sm mt-1 font-body">
            Admin Dashboard — Quản lý quán
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-xl border border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-secondary/70 uppercase tracking-wider mb-1.5 block font-body">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-sm font-body text-on-surface placeholder:text-secondary/40 border-none outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-secondary/70 uppercase tracking-wider mb-1.5 block font-body">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-sm font-body text-on-surface placeholder:text-secondary/40 border-none outline-none focus:ring-2 focus:ring-primary-container/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error/10 text-error text-sm font-body px-4 py-3 rounded-xl border border-error/20">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full py-3.5 rounded-xl font-body font-bold text-base transition-all flex items-center justify-center gap-2 ${
                isLoading || !email || !password
                  ? "bg-outline-variant text-secondary cursor-not-allowed"
                  : "bg-primary-container text-white hover:bg-primary active:scale-[0.98] cursor-pointer shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-outline-variant/10">
            <p className="text-[11px] text-secondary/50 font-body text-center">
              Demo: phong1992002@gmail.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
