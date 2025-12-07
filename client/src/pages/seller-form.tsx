import Header from "@/components/Header";
import SellerPropertyForm from "@/components/SellerPropertyForm";
import Footer from "@/components/Footer";

export default function SellerFormPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <SellerPropertyForm />
      </main>
      <Footer />
    </div>
  );
}
