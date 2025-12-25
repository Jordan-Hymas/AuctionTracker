import { useEffect, useState } from 'react';

interface UpdateFlashProps {
  trigger: any; // Any value that changes
  message?: string;
}

export default function UpdateFlash({ trigger, message = 'Updated!' }: UpdateFlashProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        borderRadius: '9999px',
        fontSize: '1.25rem',
        fontWeight: '700',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)',
        animation: 'slideInDown 0.3s ease-out',
        zIndex: 9999,
      }}
    >
      ✨ {message}
    </div>
  );
}
