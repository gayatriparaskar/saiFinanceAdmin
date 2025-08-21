import { useState } from "react";
import logo from "../../Images/SVG 1 1.png"
import loginImage from "../../Images/college entrance exam-pana 1 (1).png"
import axios from "../../axios";
const Signin = () => {

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(false)

 const handleLogin= async (e)=>{
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Try multiple possible endpoints
    let response;
    try {
      response = await axios.post("/adminLogin", { email, password });
    } catch (firstError) {
      console.log('First endpoint failed, trying alternative...');
      response = await axios.post("admins/login", { user_name: email, password });
    }

    if (response.data && response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
      window.location.replace("/dash");
    } else {
      setError("Login failed: Invalid response from server");
    }
  } catch (error) {
    console.error('Login error:', error);

    if (error.isNetworkError) {
      setError("Network error: Please check your internet connection and try again.");
    } else if (error.response?.status === 401) {
      setError("Invalid email or password. Please try again.");
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
 }

  return (
    <div className="bg-bgBlue">
      <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex items-center  ">
        <div className=" w-1/2 flex justify-center items-center">
          <img src={loginImage} alt="" />
        </div>
        <div className="w-1/2   p-8 bg-bgBlue rounded-xl ">
          <div className="w-full flex flex-col ">
            <div className="self-center text-xl font-semibold flex items-center bg-transparent">
              {/* <span className="mr-1 font-bold text-2xl text-purple">Learn2Ern</span> */}
              {/* <Image src={logo} height={45} width={70} /> */}
              <img src={logo} alt="" className="w-48" />
            </div>
            <p className="mt-2 text-md text-white mt-2">
              Admin Login
            </p>
          </div>

          {error && (
            <div className="w-2/3 m-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="w-2/3 m-auto mt-8 space-y-6" method="POST" onSubmit={handleLogin}>
            <div className=" flex flex-col">
              <label className="text-sm font-bold text-purple tracking-wide text-start mb-2">
                Email
              </label>
              <input
                className=" w-full rounded-xl p-2 text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                name="email"
                placeholder="User Id"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-8 text-start flex flex-col">
              <label className="text-sm font-bold text-purple  tracking-wide text-start mb-2">
                Password
              </label>
              <input
                className=" w-full rounded-xl p-2 text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            <div className="bg-purple rounded-xl">
              <button
                className="text-white p-2 text-xl font-bold w-full disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
        </div>
       
      </div>
    </div>
  );
};

export default Signin;
