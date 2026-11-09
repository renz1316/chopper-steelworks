import { LoginForm } from "@/components/cs-login-form";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-[#EEF0F2] text-slate-900">
      <header className="bg-[#1F2933] px-6 pb-6 pt-14 text-white">
        <p className="text-3xl font-extrabold tracking-wide">CHOPPER <span className="text-orange-400">STEELWORKS</span></p>
        <p className="mt-1 text-base text-slate-300">Inventory and job order system</p>
      </header>
      <div className="h-2 bg-[#C2410C]" />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-base text-slate-600">Use the username your owner gave you.</p>
        <LoginForm />
      </main>
    </div>
  );
}
