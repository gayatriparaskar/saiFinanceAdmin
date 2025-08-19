import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { useUser } from "../../../hooks/use-user";
import { IoSettings } from "react-icons/io5";
import Logo from "../../../Images/Sai-finance-logo.png"

const NewNavbar = () => {
  const { data: user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [pro, setPro] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen2, setIsMenuOpen2] = useState(false);

  useEffect(() => {
    if (user) {
      setPro(user.profilePicUrl);
    }
  }, [user]);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="w-full top-0 flex items-center justify-between bg-white p-4 shadow-lg fixed  z-50">
      {/* Logo */}
      <div className="text-xl font-bold text-bgBlue  w-16">
        <img src={Logo} alt="" className="w-full" />
      </div>

      {/* Menu Items */}
      <ul className="flex space-x-6 font-semibold">
        <li>
          <Link to="/dash/home" className="hover:text-purple">
            Home
          </Link>
        </li>
        <li>
          <Link to="/dash/loan-account" className="hover:text-purple">
            Loan Account
          </Link>
        </li>
        <li>
          <Link to="/dash/saving-account" className="hover:text-purple">
            Saving Account
          </Link>
        </li>
        <li>
          <Link to="/dash/officer" className="hover:text-purple">
          Officer Controls
          </Link>
        </li>

        {/* User Controls */}
        <li className="relative z-100">
          <button onClick={() => toggleDropdown("payment")} className="hover:text-purple flex items-center">
            Payment Controls <MdKeyboardArrowDown size={20} />
          </button>
          {openDropdown === "payment" && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
              <Link to="/dash/payment" onClick={closeDropdown}>
                <li className="p-2 hover:bg-gray-100">Payment</li>
              </Link>
              <Link to="/dash/payment-request" onClick={closeDropdown}>
                <li className="p-2 hover:bg-gray-100">Payment Request</li>
              </Link>
            </ul>
          )}
        </li>
      </ul>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMenuOpen2(!isMenuOpen2)}
          className="flex text-sm bg-purple rounded-xl p-1 text-white text-xl font-bold focus:ring-2 focus:ring-bgBlue dark:focus:ring-bgBlue mr-4"
        >
          <IoSettings size={28} />
        </button>
      </div>

      <div
        className={`w-60 absolute z-50 right-4 top-16 border border-purple p-2 ${
          isMenuOpen2 ? "" : "hidden"
        } text-base list-none bg-bgWhite rounded-xl`}
        id="user-dropdown"
      >
        <button
          type="button"
          className="absolute top-0 right-0 p-2 text-purple hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 font-semibold"
          onClick={() => setIsMenuOpen2(false)}
        >
          <svg className="w-6 h-6 font-semibold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <br />
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex flex-col gap-2 justify-center items-center text-bgBlue font-oswald">
            <div className="w-1/3 m-auto">
              <img src={pro} alt="" className="rounded-full border m-auto" />
            </div>

            <div>
              <h1 className="text-sm font-bold">{user?.name}</h1>
              <p className="text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="w-full flex gap-4 justify-between items-center p-2 text-bgBlue font-oswald">
            <div className="ml-4">
              <p className="text-sm text-green font-semibold">Logout</p>
              {/* <h1 className="font-bold text-purple">{user?.planName}</h1> */}
            </div>

            <div className=" mr-4 text-purple">
              <IoMdLogOut onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }} size={25} cursor={"pointer"}/>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NewNavbar;
