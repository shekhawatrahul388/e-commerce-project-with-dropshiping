import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  Phone,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api").replace(/\/api\/?$/, "");

const SendOtp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }



    const cleanName = name.trim();

    if (!cleanName) {
      toast.error("Please enter your name");
      return;
    }

    if (cleanName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }



    const cleanPhone = phone
      .replace(/\D/g, "")
      .slice(0, 10);

    if (!cleanPhone) {
      toast.error("Please enter your phone number");
      return;
    }

    if (cleanPhone.length !== 10) {
      toast.error(
        "Phone number must be 10 digits"
      );
      return;
    }

    try {
      setLoading(true);



      const response = await axios.post(
        `${API_URL}/api/user/send-otp`,
        {
          name: cleanName,
          phone: cleanPhone,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "SEND OTP RESPONSE:",
        response.data
      );

      const data = response.data;



      if (data?.success === false) {
        toast.error(
          data?.message ||
            "Unable to send OTP"
        );

        return;
      }



      sessionStorage.setItem(
        "loginPhone",
        cleanPhone
      );

      sessionStorage.setItem(
        "loginName",
        cleanName
      );



      if (data?.otp) {
        sessionStorage.setItem(
          "devOtp",
          String(data.otp)
        );
      }



      toast.success(
        data?.message ||
          "OTP sent successfully"
      );



      navigate("/verify-otp", {
        state: {
          name: cleanName,
          phone: cleanPhone,
        },
      });

    } catch (error) {
      console.error(
        "SEND OTP ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to send OTP. Please try again.";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };



  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(value);
  };



  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        
        
        

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8">

          
          
          

          <div className="flex justify-center mb-6">

            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <ShoppingBag size={30} />
            </div>

          </div>

          
          
          

          <div className="text-center mb-8">

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Login / Register
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Enter your details to continue
            </p>

          </div>

          
          
          

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            
            
            

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60 transition"
              />

            </div>

            
            
            

            <div>

              <label
                htmlFor="phone"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Mobile Number
              </label>

              <div className="flex">

                

                <div className="flex items-center gap-1 px-3 bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl text-gray-700 font-bold">
                  <Phone size={16} />
                  +91
                </div>

                

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  disabled={loading}
                  className="flex-1 min-w-0 px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-r-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60 transition"
                />

              </div>

              

              <div className="flex justify-between mt-2">

                <span className="text-xs text-gray-400">
                  OTP will be sent to this number
                </span>

                <span className="text-xs text-gray-400">
                  {phone.length}/10
                </span>

              </div>

            </div>

            
            
            

            <button
              type="submit"
              disabled={
                loading ||
                phone.length !== 10 ||
                !name.trim()
              }
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP

                  <ArrowRight
                    size={20}
                  />
                </>
              )}

            </button>

          </form>

          
          
          

          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">

            <div className="flex gap-3">

              <ShieldCheck
                size={20}
                className="text-green-600 shrink-0"
              />

              <p className="text-xs text-green-700 leading-5">
                Your mobile number is used only
                for secure OTP verification.
              </p>

            </div>

          </div>

        </div>

        
        
        

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} MyStore.
          All rights reserved.
        </p>

      </div>

    </main>
  );
};

export default SendOtp;