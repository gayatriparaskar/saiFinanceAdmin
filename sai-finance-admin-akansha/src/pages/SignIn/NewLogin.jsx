import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axios";

import LogoDark from "../../Images/Sai-removebg-preview.png";
import HomeImage from "../../Images/secure-login-concept-illustration.png";

const NewLogin = () => {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("admins/login", { user_name, password });
      localStorage.setItem("token", response.data.accessToken);
      if (response.data) {
        window.location.replace("/dash");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 h-[500px]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Image */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primaryDark relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-white h-full">
              <Link className="mb-6 transition-transform hover:scale-105" to="/">
                <img className="w-36 h-auto drop-shadow-lg" src={LogoDark} alt="Logo" />
              </Link>
              <div className="w-4/5 max-w-sm flex-1 flex items-center">
                <img className="w-full h-auto drop-shadow-xl" src={HomeImage} alt="Secure Login" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Welcome Back!</h3>
                <p className="text-primaryLight opacity-90 text-sm">Secure access to your financial dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <Link className="inline-block transition-transform hover:scale-105" to="/">
                  <img className="w-24 h-auto" src={LogoDark} alt="Logo" />
                </Link>
              </div>

              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  Sign In
                </h2>
                <p className="text-gray-600 text-sm">
                  Access your Sai Finance dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      placeholder="Enter your email"
                      value={user_name}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Secure login powered by Sai Finance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
