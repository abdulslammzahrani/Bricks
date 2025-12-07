import Header from "@/components/Header";
import InteractiveWishForm from "@/components/InteractiveWishForm";
import Footer from "@/components/Footer";

export default function BuyerFormPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <InteractiveWishForm />
      </main>
      <Footer />
    </div>
  );
}
