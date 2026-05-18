export default function AlertMessage({ type = 'error', message }) {
  if (!message) return null;
  const styles = {
    error: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' },
    success: { background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46' }
  };
  return (
    <div style={{ ...styles[type], padding: '12px 16px', borderRadius: '6px', marginBottom: '16px' }}>
      {message}
    </div>
  );
}
