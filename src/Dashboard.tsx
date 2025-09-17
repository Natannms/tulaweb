// src/Dashboard.tsx
import { useUser, useClerk } from "@clerk/clerk-react";

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 24,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        color: 'black'
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>
        🎉 Bem-vindo(a)
      </h1>

      <h2>VOoê pode acessar atrávez do email {user?.primaryEmailAddress?.emailAddress}</h2>


      {/* Seção de Download do App */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2>📲 Baixe o App</h2>
        <p>Tenha acesso a todos os recursos direto do seu celular.</p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
          <a
            href="https://play.google.com/store/apps/details?id=com.suaempresa.tula"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              style={{ height: 60 }}
            />
          </a>
          <a
            href="https://apps.apple.com/br/app/seu-app/id123456789"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              style={{ height: 60 }}
            />
          </a>
        </div>
      </div>

      {/* QRCode */}
      <div style={{ textAlign: "center" }}>
        <h3>Ou escaneie o QR Code:</h3>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tula.page.link/download`}
          alt="QR Code"
        />
      </div>

      {/* Logout */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={() => signOut()}
          style={{
            padding: "10px 16px",
            background: "#e5e7eb",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
