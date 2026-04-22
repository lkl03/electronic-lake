import { cookies } from "next/headers";
import { readCatalog } from "@/lib/catalog";
import { LoginForm } from "./LoginForm";
import { AdminDashboard } from "./AdminDashboard";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_auth")?.value === "1";

  if (!isAuthed) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-md flex-col justify-center px-5 py-16">
        <Logo width={160} height={56} className="h-12 w-auto" />
        <h1 className="mt-8 font-display text-5xl leading-none tracking-[-0.02em]">
          Panel
          <br />
          <span className="font-display-italic text-moss">privado.</span>
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
          Ingresá la contraseña para continuar.
        </p>
        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    );
  }

  const catalog = await readCatalog();
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-16">
      <AdminDashboard initial={catalog} />
    </div>
  );
}
