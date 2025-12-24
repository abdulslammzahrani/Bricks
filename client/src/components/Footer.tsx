import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { SiWhatsapp, SiX, SiInstagram } from "react-icons/si";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">بركس</span>
            </div>
            <p className="text-muted-foreground text-sm">
              منصة المطابقة العقارية الذكية التي تربط بين المشترين والبائعين بسهولة وفعالية
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover-elevate" data-testid="link-whatsapp">
                <SiWhatsapp className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover-elevate" data-testid="link-twitter">
                <SiX className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover-elevate" data-testid="link-instagram">
                <SiInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-home">
                  الرئيسية
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">الدعم</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-faq">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>جدة، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@bricks.sa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">© 2024 بركس. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
