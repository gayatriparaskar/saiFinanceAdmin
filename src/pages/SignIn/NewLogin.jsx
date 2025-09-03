import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";

import LogoDark from "../../Images/Sai-removebg-preview.png";
import HomeImage from "../../Images/secure-login-concept-illustration.png";

const NewLogin = () => {
  const navigate = useNavigate();
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let response;
    let isOfficer = false;

    try {
      // Try officer login first (most common for panel users)
      try {
        console.log('Attempting officer login with:', { phone_number: user_name, password });
        response = await axios.post("officers/login", { phone_number: user_name, password });
        isOfficer = true;
        console.log('Officer login successful - Response:', response?.data);
      } catch (officerError) {
        console.log('Officer login failed, trying admin login...', officerError.response?.status);
        // Fallback to admin login
        try {
          response = await axios.post("admins/login", { user_name, password });
          console.log('Admin login successful');
        } catch (adminError) {
          console.log('All login attempts failed');
          throw adminError;
        }
      }

      // Check if we have a successful response
      console.log('Checking response structure:', response?.data);
      
      if (response && response.data) {
        // Normalize accessToken from different response shapes
        let accessToken;
        let officerData;
        if (isOfficer && response.data?.result) {
          // successResponse shape
          accessToken = response.data.result?.accessToken;
          officerData = response.data.result;
        } else if (response.data?.accessToken) {
          accessToken = response.data.accessToken;
          officerData = response.data;
        } else if (response.data?.token) {
          accessToken = response.data.token;
          officerData = response.data;
        }
        
        if (accessToken) {
          localStorage.setItem("token", accessToken);
          
          if (isOfficer) {
            // Store officer info for dashboard routing
            localStorage.setItem("officerType", officerData.officer_type);
            localStorage.setItem("userType", "officer");
            
            // Store officer name and other details for display
            if (officerData.name) {
              localStorage.setItem("officerName", officerData.name);
            } else if (officerData.first_name && officerData.name) {
              localStorage.setItem("officerName", `${officerData.name} ${officerData.name}`);
            } else if (officerData.phone_number) {
              localStorage.setItem("officerName", officerData.phone_number);
            } else {
              localStorage.setItem("officerName", "Officer");
            }
            
            console.log('Officer login successful, redirecting to:', officerData.officer_type);
            console.log('Officer data:', officerData);
            
            // Redirect based on officer type
            console.log('Attempting redirect for officer type:', officerData.officer_type);
            
            // Small delay to ensure state is set
            setTimeout(() => {
              try {
                switch (officerData.officer_type) {
                  case "manager":
                    console.log('Redirecting to manager dashboard...');
                    navigate("/manager-dashboard");
                    break;
                  case "accounter":
                    console.log('Redirecting to accounter dashboard...');
                    navigate("/accounter-dashboard");
                    break;
                  case "collection_officer":
                    console.log('Redirecting to collection dashboard...');
                    navigate("/collection-dashboard");
                    break;
                  default:
                    console.log('Unknown officer type:', officerData.officer_type, 'redirecting to default dashboard');
                    navigate("/dash");
                }
              } catch (redirectError) {
                console.error('Redirect error:', redirectError);
                // Fallback to window.location
                try {
                  window.location.href = `/${officerData.officer_type === 'collection_officer' ? 'collection' : officerData.officer_type}-dashboard`;
                } catch (fallbackError) {
                  console.error('Fallback redirect also failed:', fallbackError);
                  setError("Login successful but redirect failed. Please navigate manually.");
                }
              }
            }, 100);
          } else {
            localStorage.setItem("userType", "admin");
            console.log('Admin login successful, redirecting to admin dashboard');
            window.location.replace("/dash/home");
          }
        } else {
          console.log('No access token found in response');
          console.log('Response data structure:', response.data);
          setError(isOfficer
            ? "Login failed. For officer accounts, use phone number as password if not set."
            : "Login failed: No access token received");
        }
      } else {
        console.log('Invalid response structure');
        setError("Login failed: Invalid response from server");
      }
    } catch (error) {
      console.error('Final login error:', error);

      if (error.isNetworkError) {
        setError("Network error: Please check your internet connection and try again.");
      } else if (error.response?.status === 401) {
        setError("Invalid username/phone number or password. Please try again.");
      } else if (error.response?.status === 404) {
        setError("Login service not available. Please contact support.");
      } else if (error.isTimeout) {
        setError("Request timeout. Please try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primaryBg via-white to-secondaryBg flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-gray-100 h-auto min-h-[500px] sm:h-[500px]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Image */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primaryDark relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center justify-center p-6 lg:p-8 text-white h-full">
              <Link className="mb-4 lg:mb-6 transition-transform hover:scale-105" to="/">
                <img className="w-28 lg:w-36 h-auto drop-shadow-lg" src={LogoDark} alt="Logo" />
              </Link>
              <div className="w-4/5 max-w-sm flex-1 flex items-center">
                <img className="w-full h-auto drop-shadow-xl" src={HomeImage} alt="Secure Login" />
              </div>
              <div className="text-center">
                <h3 className="text-lg lg:text-xl font-bold mb-1">Welcome Back!</h3>
                <p className="text-primaryLight opacity-90 text-xs lg:text-sm">Secure access to your financial dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-4 sm:mb-6">
                <Link className="inline-block transition-transform hover:scale-105" to="/">
                  <img className="w-20 sm:w-24 h-auto" src={LogoDark} alt="Logo" />
                </Link>
              </div>

              <div className="text-center lg:text-left mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  Sign In
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Access your Sai Finance dashboard
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address / Phone Number
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      placeholder="Enter your email or phone number"
                      value={user_name}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2 sm:py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-sm"
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
                      className="w-full px-3 py-2 sm:py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-sm"
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
                    className="w-full bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm"
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
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Secure login powered by Sai Finance
                </p>
                
                {/* Debug Test Button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      console.log('Testing officer endpoint...');
                      const testResponse = await axios.get('officers/health');
                      console.log('Officer endpoint test successful:', testResponse.data);
                      alert('Officer endpoint is working!');
                    } catch (error) {
                      console.error('Officer endpoint test failed:', error);
                      alert('Officer endpoint test failed: ' + error.message);
                    }
                  }}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  Test Officer Endpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
