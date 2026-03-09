import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";

import LogoDark from "../../Images/Sai-removebg-preview.png";
import MobileLoginImage from "../../Images/loginImage4.png";

const NewLogin = () => {
  const navigate = useNavigate();
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let response;
    let isOfficer = false;

    try {
      // Clear any existing token to ensure fresh login
      localStorage.removeItem("token");
      axios.defaults.headers.common['Authorization'] = undefined;
      
      // Try officer login first (most common for panel users)
      try {
        console.log('Attempting officer login with:', { phone_number: user_name, password });
        response = await axios.post("officers/login", { phone_number: user_name, password });
        console.log("officer login response", response);
        
        isOfficer = true;
        console.log('Officer login successful - Response:', response?.data);
      } catch (officerError) {
        console.log('Officer login failed, trying admin login...', officerError.response?.status);
        
        // If officer login fails due to network/timeout, try once more
        if (officerError.code === 'ECONNABORTED' || officerError.message === 'Network Error') {
          console.log('Retrying officer login due to network issue...');
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            response = await axios.post("officers/login", { phone_number: user_name, password });
            isOfficer = true;
            console.log('Officer login successful on retry - Response:', response?.data);
          } catch (retryError) {
            console.log('Officer login retry also failed, trying admin login...');
          }
        }
        
        // If still no success, try admin login
        if (!response) {
          try {
            response = await axios.post("admins/login", { user_name, password });
            console.log('Admin login successful');
          } catch (adminError) {
            console.log('All login attempts failed');
            throw adminError;
          }
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
          
          // Force axios to pick up the new token immediately
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 justify-center items-center">
          <div className="relative">
            <img 
              src={MobileLoginImage} 
              alt="Login Illustration" 
              className="w-full h-auto max-w-lg xl:max-w-xl object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 max-w-md">
          <div className="bg-white-50 rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8">
              <Link className="inline-block transition-transform hover:scale-105" to="/">
                <img className="w-full sm:w-16 sm:h-16 mx-auto rounded-2xl" src={LogoDark} alt="Logo" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-teal-800 mt-3 sm:mt-4">Sai Finance</h1>
              <p className="text-teal-600 text-xs sm:text-sm">Sign in to your account</p>
            </div>
          {/* Form Section */}

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2 transition-transform hover:scale-105">
                Email Address / Phone Number
              </label>
              <div className="relative">
                <input
                  name="email"
                  placeholder="Enter your email or phone number"
                  value={user_name}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-600 rounded-lg  text-gray-800  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-blue-400 hover:text-blue-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-blue-100 text-gray-800 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-400 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-blue-500">
                Secure login powered by Sai Finance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
