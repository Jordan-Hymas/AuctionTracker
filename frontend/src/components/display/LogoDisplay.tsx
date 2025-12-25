interface LogoDisplayProps {
  logoUrl: string | null;
}

export default function LogoDisplay({ logoUrl }: LogoDisplayProps) {
  if (!logoUrl) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
      }}
    >
      <img
        src={logoUrl}
        alt="Organization logo"
        style={{
          width: 'clamp(200px, 30vw, 400px)',
          height: 'clamp(100px, 15vh, 200px)',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
        }}
      />
    </div>
  );
}
