import { useState } from 'react';

const Navbar = ({ isLoggedIn, ToLogin, ToSignup, ToLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  function Logout() {
    const Token = localStorage.getItem("Token")

    if (!Token) {return}


    localStorage.removeItem("Token")
    ToLogout()
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', position: 'relative' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Learning Quest</div>
      
      <div style={{ display: 'flex', gap: '15px' }}>
        {isLoggedIn ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDropdown(!showDropdown)} style={buttonStyle}>
              Account
            </button>
            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={dropdownStyle}>
                <button style={menuItemStyle}>Profile</button>
                <button style={menuItemStyle}>Settings</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={Logout} style={menuItemStyle}>Log out</button>

          </>
        )}
      </div>
    </nav>
  );
};

// Styles
const buttonStyle = { backgroundColor: '#000', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' };
const dropdownStyle = { position: 'absolute', top: '45px', right: '0', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '5px' };
const menuItemStyle = { background: 'transparent', border: 'none', textAlign: 'left', padding: '5px 10px', cursor: 'pointer' };

export default Navbar;