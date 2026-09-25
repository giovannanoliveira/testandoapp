import { useState } from "react";
import { Home, X } from "lucide-react";
import "./_group.css";

export function Current() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleGoogle() {
    setLoading(true);
    setMessage("");
    window.setTimeout(() => {
      setLoading(false);
      setMessage("Protótipo: aqui o app abre a página segura do Google.");
    }, 900);
  }

  return (
    <main
      aria-label="Tela de entrada do Vizinhança Real"
      className="relative flex h-screen min-h-[760px] w-full flex-col overflow-hidden px-6 pb-[58px] pt-[75px]"
      style={{ backgroundColor: "var(--vr-background)", color: "var(--vr-foreground)" }}
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute right-6 top-[79px] grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: "var(--vr-foreground)", outlineColor: "var(--vr-primary)" }}
      >
        <X size={22} strokeWidth={2.1} />
      </button>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div
          className="mb-1 grid size-16 place-items-center rounded-full"
          style={{ backgroundColor: "var(--vr-accent)", color: "var(--vr-primary)" }}
        >
          <Home size={28} strokeWidth={2.1} />
        </div>

        <p className="m-0 text-[17px] font-bold leading-6" style={{ color: "var(--vr-primary)" }}>
          Vizinhança Real
        </p>

        <h1 className="m-0 max-w-[320px] text-[25px] font-bold leading-8 tracking-[-0.35px]">
          Entre para compartilhar sua experiência
        </h1>

        <p
          className="m-0 mb-[18px] max-w-[330px] text-sm font-normal leading-[21px]"
          style={{ color: "var(--vr-muted-foreground)" }}
        >
          Avalie imóveis onde você já morou e ajude outras pessoas a decidir com mais segurança.
        </p>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 border px-[15px] text-sm font-semibold transition-all hover:-translate-y-px hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70"
          style={{
            backgroundColor: "var(--vr-card)",
            borderColor: "var(--vr-border)",
            borderRadius: 14,
            color: "var(--vr-foreground)",
            outlineColor: "var(--vr-primary)",
          }}
        >
          {loading ? (
            <span
              aria-label="Carregando"
              className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              style={{ color: "var(--vr-primary)" }}
            />
          ) : (
            <>
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full border bg-white text-base font-bold"
                style={{ borderColor: "var(--vr-border)", color: "var(--vr-google-blue)" }}
              >
                G
              </span>
              <span>Entrar ou cadastrar com o Google</span>
            </>
          )}
        </button>

        {message ? (
          <p className="m-0 max-w-[320px] text-xs leading-[18px]" style={{ color: "var(--vr-primary)" }}>
            {message}
          </p>
        ) : null}

        <p
          className="m-0 mt-1.5 max-w-[320px] text-[10px] font-normal leading-[15px]"
          style={{ color: "var(--vr-muted-foreground)" }}
        >
          Ao continuar, você concorda em usar o app de forma responsável e publicar apenas relatos
          verdadeiros.
        </p>
      </section>
    </main>
  );
}