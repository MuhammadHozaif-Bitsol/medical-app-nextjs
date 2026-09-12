"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { loginAction, registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormData {
  name: string;
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setAuthError(null);
    setShowPassword(false);
    reset({
      name: "",
      email: "",
      password: "",
    });
  };

  const onSubmit = async (data: AuthFormData, e?: React.BaseSyntheticEvent) => {
    setAuthError(null);

    // Fallback to native FormData in case browser auto-fill/password manager didn't sync RHF state
    let name = data.name;
    let email = data.email;
    let password = data.password;

    if (e?.target) {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      name = name || (formData.get("name") as string) || "";
      email = email || (formData.get("email") as string) || "";
      password = password || (formData.get("password") as string) || "";
    }

    try {
      if (isLoginMode) {
        await loginAction(email, password);
      } else {
        await registerAction(name, email, password);
      }
    } catch (error) {
      // Next.js redirect() throws a NEXT_REDIRECT error internally to perform navigation.
      // Ignore it so it does not flash a red error banner before the page changes.
      if (
        error instanceof Error &&
        (error.message === "NEXT_REDIRECT" ||
          (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      ) {
        return;
      }

      setAuthError(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.",
      );
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isLoginMode ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="text-slate-500 mt-2">
          {isLoginMode
            ? "Sign in to access your dashboard"
            : "Register as a patient to book appointments"}
        </p>
      </div>
      {authError && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
          {authError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLoginMode && (
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            {...register("name", {
              required: !isLoginMode ? "Name is required" : false,
            })}
            error={errors.name?.message}
          />
        )}
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/,
              message: "Please enter a valid email address",
            },
          })}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          error={errors.password?.message}
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {isLoginMode ? "Sign In" : "Register"}
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-slate-600">
        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={toggleMode}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          {isLoginMode ? "Sign up here" : "Sign in here"}
        </button>
      </div>
    </div>
  );
};
