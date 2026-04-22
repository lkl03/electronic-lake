import { cookies } from "next/headers";
import { readCatalog } from "@/lib/catalog";
import { LoginForm } from "./LoginForm";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_auth")?.value === "1";

  if (!isAuthed) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Ingresá la contraseña para gestionar el catálogo.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    );
  }

  const catalog = await readCatalog();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <AdminDashboard initial={catalog} />
    </div>
  );
}
