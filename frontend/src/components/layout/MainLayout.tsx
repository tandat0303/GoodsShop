import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAppSelector } from "../../redux";

export default function MainLayout() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0d1117]">
      <Header user={user ?? undefined} />

      <main className="mx-auto w-full max-w-8xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
