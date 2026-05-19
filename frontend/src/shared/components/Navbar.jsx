import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/vendors', label: 'Vendors' },
  { to: '/customers/register', label: 'Register Customer' },
  { to: '/customers', label: 'Customers' },
  { to: '/sales-invoices/new', label: 'New Invoice' },
  { to: '/parts', label: 'Parts (Test)' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#1e3a5f',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '52px'
    }}>
      <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginRight: '24px' }}>
        Vehicle Parts System
      </span>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            color: isActive ? '#93c5fd' : '#cbd5e1',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
          })}
        >
          {link.label}
        </NavLink>
      ))}
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <span style={{ color: 'white', fontSize: '14px' }}>
              Welcome, <span style={{ fontWeight: '600' }}>{user.fullName}</span> ({user.role})
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
