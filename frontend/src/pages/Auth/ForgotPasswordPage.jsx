import React, { useState } from "react";
import { forgotPassword } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await forgotPassword(email);
    setMsg(data.message);
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button>Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
