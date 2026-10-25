"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ImageProps = { name: string; category: string; image: string | null };

// About a third of wger exercises have a picture. The rest get a same-sized placeholder so names stay aligned.
export function ExerciseThumb({ name, category, image }: ImageProps) {
  const box =
    "size-12 shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800";
  if (!image) {
    return (
      <span
        aria-hidden
        className={`${box} flex items-center justify-center text-lg font-semibold text-zinc-400 dark:bg-zinc-900`}
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
      className="m-auto w-[min(92vw,28rem)] rounded-2xl bg-white p-0 text-zinc-900 backdrop:bg-black/60 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <div className="flex flex-col gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="max-h-[60vh] w-full rounded-xl bg-white object-contain"
        />
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-zinc-500">{category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium dark:border-zinc-700"
          >
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
        className="shrink-0"
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
