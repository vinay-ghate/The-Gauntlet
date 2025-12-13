import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
            <LoginForm />
        </main>
    );
}
