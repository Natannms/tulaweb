
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { acceptInvite } from "./services/inviteService";


// --------------------
// Formulário de Registro
// --------------------
export default function RegisterForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const passwordsOk = pass.length >= 6 && pass === confirm;
  const canSubmit = name.trim() && validEmail && passwordsOk && !loading;

  // Criação do usuário
  const onSignUpPress = async () => {
    if (!isLoaded || !canSubmit || !token) return;

    try {
      setLoading(true);
      await signUp.create({
        emailAddress: email,
        password: pass,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setError(null);
    } catch (e: any) {
      setError(e?.errors?.[0]?.longMessage ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Verificação e aceite do convite
  const onVerifyPress = async () => {
    if (!isLoaded || !code) return;
    try {
      setLoading(true);
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });

        // se veio de convite
        if (token) {
          try {
            await acceptInvite(token, attempt.createdUserId!);

            // remove token da URL
            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState({}, "", url.toString());
          } catch (err: any) {
            console.error("Erro ao aceitar convite:", err.message);
            setError(err.message);
          }
        }

        // redireciona pós login
        navigate("/dashboard");
      } else {
        console.log(attempt);
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.longMessage ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Create account</h2>
      {error && (
        <p style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
          {error}
        </p>
      )}

      {pendingVerification ? (
        <>
          <label>Verification code</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />
          <button
            onClick={onVerifyPress}
            disabled={!code || loading}
            style={{
              width: "100%",
              padding: 12,
              background: "#f43f5e",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      ) : (
        <>
          <label>Full name</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <label>Email</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />

          <label>Password</label>
          <input
            type="password"
            style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="******"
          />

          <label>Confirm password</label>
          <input
            type="password"
            style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="******"
          />

          <button
            onClick={onSignUpPress}
            disabled={!canSubmit || loading}
            style={{
              width: "100%",
              padding: 12,
              background: canSubmit ? "#f43f5e" : "#fda4af",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </>
      )}
    </div>
  );
}

