import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const API_URL = (import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api").replace(/\/api\/?$/, "");

const defaultFooter = {
  companyName: "MyStore",
  description:
    "Shop smarter with quality products at the best prices.",
  phone: "",
  email: "",
  address: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  copyright: "© 2026 MyStore. All rights reserved.",
};

const Footer = () => {
  const [footer, setFooter] = useState(defaultFooter);
  const [siteLogo, setSiteLogo] = useState("");
  const [siteName, setSiteName] = useState("");
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    let mounted = true;

    const getFooter = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_URL}/api/footer`,
          {
            timeout: 5000,
          }
        );

        console.log(
          "FOOTER API RESPONSE:",
          response.data
        );

        if (!mounted) return;

        const data = response.data || {};




        const footerData =
          data.footer ||
          data.data ||
          data;

        if (
          footerData &&
          typeof footerData === "object"
        ) {
          setFooter({
            ...defaultFooter,
            ...footerData,
          });
        }
      } catch (error) {
        console.error(
          "FOOTER FETCH ERROR:",
          error?.response?.data ||
            error?.message
        );


        if (mounted) {
          setFooter(defaultFooter);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getFooter();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    axios
      .get(`${API_URL}/api/settings`, { timeout: 5000 })
      .then((response) => {
        if (!mounted) return;

        const settings = response.data?.settings || {};
        setSiteLogo(settings.logo || "");
        setSiteName(settings.siteName || "");
      })
      .catch((error) => {
        console.error("FOOTER SITE SETTINGS ERROR:", error?.response?.data || error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const logoSource = siteLogo && /^(https?:|data:)/i.test(siteLogo)
    ? siteLogo
    : siteLogo
      ? `${API_URL}${siteLogo.startsWith("/") ? siteLogo : `/${siteLogo}`}`
      : "";



  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="h-7 w-40 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-gray-800 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-6 w-28 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-36 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-44 rounded bg-gray-800 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-6 w-28 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-800 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-6 w-28 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4">

        

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-blue-600">
              {logoSource ? (
                <img src={logoSource} alt={siteName || footer.companyName || "MyStore"} className="h-full w-full object-contain p-1.5" />
              ) : (
                <ShoppingBag size={22} />
              )}
            </div>

            <h2 className="text-2xl font-black">
              {siteName || footer.companyName ||
                "MyStore"}
            </h2>
          </div>

          <p className="mb-5 max-w-sm text-sm leading-6 text-gray-400">
            {footer.description ||
              "Shop smarter with quality products at the best prices."}
          </p>

          

          <div className="flex items-center gap-3">

            {footer.facebook && (
              <a
                href={footer.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition hover:bg-blue-600 hover:text-white"
              >
                <FaFacebook size={18} />
              </a>
            )}

            {footer.instagram && (
              <a
                href={footer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition hover:bg-pink-600 hover:text-white"
              >
                <FaInstagram size={18} />
              </a>
            )}

            {footer.twitter && (
              <a
                href={footer.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition hover:bg-sky-500 hover:text-white"
              >
                <FaTwitter size={18} />
              </a>
            )}

            {footer.youtube && (
              <a
                href={footer.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition hover:bg-red-600 hover:text-white"
              >
                <FaYoutube size={18} />
              </a>
            )}

          </div>
        </div>

        

        <div>
          <h3 className="mb-5 text-lg font-bold">
            Contact Us
          </h3>

          <div className="space-y-4 text-sm text-gray-400">

            {footer.phone && (
              <a
                href={`tel:${footer.phone}`}
                className="flex items-start gap-3 transition hover:text-white"
              >
                <Phone
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <span>
                  {footer.phone}
                </span>
              </a>
            )}

            {footer.email && (
              <a
                href={`mailto:${footer.email}`}
                className="flex items-start gap-3 transition hover:text-white"
              >
                <Mail
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <span className="break-all">
                  {footer.email}
                </span>
              </a>
            )}

            {footer.address && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <span className="leading-6">
                  {footer.address}
                </span>
              </div>
            )}

          </div>
        </div>

        

        <div>
          <h3 className="mb-5 text-lg font-bold">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-sm text-gray-400">

            <Link
              to="/"
              className="transition hover:translate-x-1 hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="transition hover:translate-x-1 hover:text-white"
            >
              Products
            </Link>

            <Link
              to="/cart"
              className="transition hover:translate-x-1 hover:text-white"
            >
              Cart
            </Link>

            <Link
              to="/wishlist"
              className="transition hover:translate-x-1 hover:text-white"
            >
              Wishlist
            </Link>

            <Link
              to="/create-store"
              className="transition hover:translate-x-1 hover:text-white"
            >
              Start Dropshipping
            </Link>

          </div>
        </div>

        

        <div>
          <h3 className="mb-5 text-lg font-bold">
            Shopping
          </h3>

          <div className="flex flex-col gap-3 text-sm text-gray-400">

            <Link
              to="/profile"
              className="transition hover:translate-x-1 hover:text-white"
            >
              My Profile
            </Link>

            <Link
              to="/address"
              className="transition hover:translate-x-1 hover:text-white"
            >
              My Addresses
            </Link>

          </div>
        </div>

      </div>

      

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-center text-sm text-gray-500 sm:flex-row sm:px-8">

          <p>
            {footer.copyright ||
              `© 2026 ${
                footer.companyName ||
                "MyStore"
              }. All rights reserved.`}
          </p>

          <p className="text-xs text-gray-600">
            Shop with confidence
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;