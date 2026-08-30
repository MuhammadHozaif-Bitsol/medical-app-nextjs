import React from "react";
import Image from "next/image";

export interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt = "", className = "" }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};
