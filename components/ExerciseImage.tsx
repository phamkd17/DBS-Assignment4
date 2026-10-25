"use client";

import { focusRing, label, secondary } from "./styles";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ImageProps = { name: string; category: string; image: string | null };

// About a third of wger exercises have a picture. The rest get a same-sized placeholder so names stay aligned.
export function ExerciseThumb({ name, category, image }: ImageProps) {
  const box = "size-14 shrink-0 border border-ls-border bg-white";
  if (!image) {
    return (
      <span
        aria-hidden
        className={`${box} flex items-center justify-center bg-ls-bg font-ls-serif text-2xl text-ls-muted`}
      >
        {category[0]}
      </span>
    );
  }
  // Plain <img>: wger's images are already small, and lazy loading only fetches the ones on screen.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`${box} object-contain p-0.5`}
    />
  );
}

// A native <dialog> gives us focus trapping, Esc to close, and a dimmed backdrop for free.
export function ImagePreview({
  name,
  category,
  image,
  onClose,
  children,
}: ImageProps & { image: string; onClose: () => void; children?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={name}
      className="m-auto w-[min(92vw,28rem)] border border-ls-ink bg-ls-surface p-0 text-ls-ink"
    >
      <div className="flex flex-col gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="max-h-[60vh] w-full border border-ls-border bg-white object-contain"
        />
        <div>
          <h3 className="font-ls-serif text-[28px] leading-tight">{name}</h3>
          <p className={label}>{category}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className={`${secondary} flex-1`}>
            Back
          </button>
          {children}
        </div>
      </div>
    </dialog>
  );
}

// A thumbnail that opens the bigger preview when tapped (used on workout cards).
export function ZoomableThumb(props: ImageProps) {
  const [open, setOpen] = useState(false);
  if (!props.image) return <ExerciseThumb {...props} />;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Show a bigger picture of ${props.name}`}
        className={`shrink-0 cursor-zoom-in ${focusRing}`}
      >
        <ExerciseThumb {...props} />
      </button>
      {open && (
        <ImagePreview
          {...props}
          image={props.image}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
