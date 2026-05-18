export default function InputField({ label, name, type = 'text', value, onChange, required, error }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
      {error && <span style={{ color: '#dc2626', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}
