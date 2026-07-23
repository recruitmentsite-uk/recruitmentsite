import Image from "next/image";

interface UnsplashImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function UnsplashImage({
  src,
  alt,
  className = "",
  priority = false,
  fill = false,
  width,
  height,
}: UnsplashImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
