export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled }) {
  const bg = { primary: '#2563eb', danger: '#dc2626', secondary: '#6b7280' }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: bg,
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        opacity: disabled ? 0.7 : 1
      }}
    >
      {children}
    </button>
  );
}
