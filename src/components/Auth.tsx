import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import GithubIcon from "../assets/github.svg?react";

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: import.meta.env.DEV
            ? import.meta.env.VITE_DEV_AUTH_REDIRECT
            : import.meta.env.VITE_PROD_AUTH_REDIRECT,
        },
      });
      if (error) throw error;
    } catch {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-body)",
      }}
    >
      <div style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "var(--radius-md)",
              background: message.type === "error" ? "#fee2e2" : "#dcfce7",
              color:
                message.type === "error" ? "var(--danger)" : "var(--success)",
              border: `1px solid ${message.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px" }}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : (
              <div className="text-2xl text-black flex gap-2">
                Sign in with github
                <GithubIcon className="w-8" />
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
