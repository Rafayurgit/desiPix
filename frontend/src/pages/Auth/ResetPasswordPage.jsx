import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const token = params.get("token");
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await resetPassword({ token, newPassword: password });
    setMsg(data.message);
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Reset</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
