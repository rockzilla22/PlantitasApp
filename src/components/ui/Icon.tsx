interface IconProps {
  src: string;
  size?: number;
  alt?: string;
  className?: string;
}

export function Icon({ src, size = 18, alt = "", className = "object-contain" }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} alt={alt} className={className} />
  );
}
