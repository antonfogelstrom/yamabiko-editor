import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import GithubIcon from "../assets/github.svg?react";

const WELCOME_MESSAGES = [
  "物語を紡ぎましょう",
  "新しい世界が待っています",
  "あなたの想像力を形に",
  "心に響く言葉を",
  "最高の一行を書き留めよう",
  "無限の物語がここから始まる",
  "魂を吹き込む準備はいい？",
  "創作の時間です",
  "一歩ずつ、名作へ",
  "今日も素晴らしい執筆を",
  "筆を進めましょう",
  "情熱を文字に乗せて",
  "おかえりなさい、作者様",
  "執筆の準備が整いました",
  "あなたの続きを楽しみにしています",
  "創造の扉を開こう",
  "物語の続きへ",
  "さあ、描こう",
  "言葉に命を",
  "夢を現実に",
];

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [welcome] = useState<string>(
    WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(async () => {
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
        setMessage({ text: "An error occurred during sign in", type: "error" });
        setLoading(false);
      }
    }, 10);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {welcome}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your dialogue scenes
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <GithubIcon className="h-5 w-5 text-white" />
                Sign in with GitHub
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
