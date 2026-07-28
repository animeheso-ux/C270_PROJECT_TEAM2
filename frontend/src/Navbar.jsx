import { useState } from "react";
import "./Navbar.css";

const Navbar = ({isLoggedIn,ToLogin,ToSignup,ToLogout,OnBrandClick,OnProfileClick,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  function Logout() {
    const token = localStorage.getItem("Token");

    if (token) {
      localStorage.removeItem("Token");
    }

    setShowDropdown(false);

    if (ToLogout) {
      ToLogout();
    }
  }

  return (
    <nav className="LQ-Navbar">
      <button
        type="button" className="LQ-NavbarBrand" onClick={OnBrandClick}>
        <span className="LQ-BrandMark">LQ</span>

        <span className="LQ-BrandText">Learning Quest
          <small>Learn. Practice. Progress.</small>
        </span>
      </button>

      <div className="LQ-NavbarActions">
        {isLoggedIn ? (
          <div className="LQ-AccountWrapper">
            <button
              type="button" className="LQ-AccountButton" onClick={() => setShowDropdown((previous) => !previous)}aria-expanded={showDropdown}>
              <span className="LQ-AccountIcon">●</span>
              Account
              <span
                className={`LQ-DropdownArrow ${
                  showDropdown ? "is-open" : ""
                }`}
              >
                ↓
              </span>
            </button>

            {showDropdown && (
              <div className="LQ-Dropdown">
                <div className="LQ-DropdownLabel">Account menu</div>

                <button
                  type="button" className="LQ-DropdownItem" onClick={() => { setShowDropdown(false); OnProfileClick?.(); }}
                >
                  <span>Profile</span>
                  <span>→</span>
                </button>

                <button
                  type="button" className="LQ-DropdownItem" onClick={() => setShowDropdown(false)}>
                  <span>Settings</span>
                  <span>→</span>
                </button>

                <div className="LQ-DropdownDivider" />

                <button
                  type="button" className="LQ-DropdownItem LQ-LogoutItem" onClick={Logout}>
                  <span>Log out</span>
                  <span>↗</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              type="button" className="LQ-TextButton" onClick={ToLogin}>Log in
            </button>

            <button
              type="button" className="LQ-SignupButton" onClick={ToSignup}>Create account
              <span>→</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;