import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  validatePassword,
} from "firebase/auth";
import type { PasswordValidationStatus } from "firebase/auth";
import { auth } from "../lib/firebase";
import { isWmuEmail } from "../lib/wmu";
import { authErrorMessage } from "../lib/authErrors";
import { passwordChecks } from "../lib/passwordPolicy";
import PasswordInput from "../components/PasswordInput";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<PasswordValidationStatus | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const latestPassword = useRef("");

  useEffect(() => {
    validatePassword(auth, "")
      .then((result) => {
        if (latestPassword.current === "") setStatus(result);
      })
      .catch(() => setStatus(null));
  }, []);

  async function handlePasswordChange(value: string) {
    setPassword(value);
    latestPassword.current = value;
    try {
      const result = await validatePassword(auth, value);
      if (latestPassword.current === value) setStatus(result);
    } catch {
      setStatus(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!isWmuEmail(cleanEmail)) {
      setError("Use your @wmich.edu email address.");
      return;
    }
    if (status && !status.isValid) {
      setError("Password does not meet all the requirements listed below.");
      return;
    }
    if (!status && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await sendEmailVerification(credential.user);
      navigate("/verify", { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const checks = status ? passwordChecks(status) : [];

  return (
    <div className="center">
      <div className="card">
        <h1>Create your account</h1>
        <p className="subtitle">Track your Lee Honors College service hours.</p>
        <form onSubmit={handleSubmit}>
          <label>
            WMU email
            <input
              type="email"
              autoComplete="email"
              placeholder="you@wmich.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </label>
          {checks.length > 0 && (
            <ul className="requirements" aria-label="Password requirements">
              {checks.map((check) => (
                <li key={check.label} className={check.met ? "met" : ""}>
                  <span className="sr-only">{check.met ? "Done: " : "Missing: "}</span>
                  {check.label}
                </li>
              ))}
            </ul>
          )}
          <label>
            Confirm password
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}