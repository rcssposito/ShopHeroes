import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/login/actions";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shop Heroes - Build Planner",
  description: "Planejador de builds e equipamentos para Shop Heroes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR" className="bg-black">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-black text-white`}
      >
        <header className="bg-[#161616] border-b border-[#393939] fixed top-0 w-full z-50 py-4">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="font-display font-bold text-2xl tracking-tighter text-white hover:text-[#3d5afe] transition-colors">
              SHOP HEROES <span className="font-light">PLANNER</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-10">
              {[
                { name: 'TIMES', href: '/' },
                { name: 'INVENTÁRIO', href: '/inventory' },
                { name: 'SKILLS', href: '/skills' }
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-xs font-black tracking-[0.2em] text-[#a8a8a8] hover:text-white transition-all underline-offset-8 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <form action={signOut}>
                  <button type="submit" className="text-xs font-black tracking-[0.2em] text-red-500 hover:text-red-400 transition-all underline-offset-8 hover:underline mt-1">
                    SAIR
                  </button>
                </form>
              ) : (
                <Link href="/login" className="text-xs font-black tracking-[0.2em] text-[#3d5afe] hover:text-white transition-all underline-offset-8 hover:underline">
                  ENTRAR
                </Link>
              )}
            </nav>
            
            <div className="md:hidden">
              <button className="p-2 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-24 pb-12">
          {children}
        </main>
        
        <footer className="py-12 bg-[#161616] border-t border-[#393939]">
          <div className="container mx-auto px-6 text-center text-[#525252] text-xs font-bold tracking-widest">
            &copy; {new Date().getFullYear()} SHOP HEROES BUILD PLANNER / HIGH CONTRAST MODE
          </div>
        </footer>
      </body>
    </html>
  );
}
