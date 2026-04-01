import { useThemeStore } from '@/stores';

/**
 * Subtle repeating pattern of the Odin logo as a background layer.
 * Rotated 15deg for a designed feel rather than a stamped grid.
 * Scaled up to cover corners exposed by the rotation.
 */
export function LogoPattern() {
  const { theme } = useThemeStore();
  const logoSrc = theme === 'light' ? '/logo2_no_padding.png' : '/logo_no_padding.png';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -inset-[50%] opacity-[0.025] rotate-[15deg]"
        style={{
          backgroundImage: `url(${logoSrc})`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
