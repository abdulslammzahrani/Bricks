import Header from "@/components/Header";
import BuyerWishForm from "@/components/BuyerWishForm";
import Footer from "@/components/Footer";

export default function BuyerFormPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <BuyerWishForm />
      </main>
      <Footer />
    </div>
  );
}
