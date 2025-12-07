import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Building2, User, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/buyer-form", label: "سجل رغبتك", icon: User },
    { href: "/seller-form", label: "اعرض عقارك", icon: Building2 },
    { href: "/admin", label: "لوحة التحكم", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold" data-testid="logo-text">تطابق</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === item.href ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-link-${item.href.replace("/", "") || "home"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" data-testid="button-login">
            <LogIn className="ml-2 h-4 w-4" />
            تسجيل الدخول
          </Button>
          <Button size="sm" data-testid="button-register">
            إنشاء حساب
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-4 mt-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover-elevate ${
                      location === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`mobile-nav-link-${item.href.replace("/", "") || "home"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                <Button variant="outline" className="w-full" data-testid="mobile-button-login">
                  <LogIn className="ml-2 h-4 w-4" />
                  تسجيل الدخول
                </Button>
                <Button className="w-full" data-testid="mobile-button-register">
                  إنشاء حساب
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
