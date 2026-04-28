import { NavLink } from 'react-router-dom';

const links = [
  { to: '/vendors', label: 'Vendors' },
  { to: '/customers/register', label: 'Register Customer' },
  { to: '/customers', label: 'Customers' },
  { to: '/sales-invoices/new', label: 'New Invoice' },
  { to: '/parts', label: 'Parts (Test)' },
];

export default function Navbar() {
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
    </nav>
  );
}
