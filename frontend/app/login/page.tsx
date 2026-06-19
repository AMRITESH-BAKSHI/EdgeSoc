"use client";

import { useState } from "react";

export default function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    await fetch(
      "/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      }
    );

    alert("Login Attempt Logged");
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Login
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md"
      >

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-2"
        />

        <button
          className="border p-2"
        >
          Login
        </button>

      </form>

    </main>
  );
}