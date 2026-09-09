import { useEffect, useState } from "react";
import { Headphones, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Support() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/whatsapp/settings")
      .then((response) => {
        const settings = response.data?.settings || response.data?.data || response.data;
        setNumber(settings?.phone || settings?.phoneNumber || settings?.whatsappNumber || settings?.number || "");
      })
      .catch(() => setNumber(""))
      .finally(() => setLoading(false));
  }, []);

  const whatsappUrl = number
    ? `https://wa.me/${String(number).replace(/\D/g, "")}`
    : "";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Headphones size={32} />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-orange-600">Customer Support</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">How can we help?</h1>
        <p className="mt-3 text-gray-500">Our support team is ready to help with products, orders, and delivery questions.</p>

        {loading ? (
          <p className="mt-8 text-sm text-gray-500">Loading support options...</p>
        ) : whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700">
            <MessageCircle size={19} />
            Chat on WhatsApp
          </a>
        ) : (
          <p className="mt-8 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">Support contact is currently unavailable. Please try again later.</p>
        )}

        <Link to="/products" className="mt-5 inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
          <ShoppingBag size={18} />
          Continue shopping
        </Link>
      </section>
    </main>
  );
}

export default Support;
