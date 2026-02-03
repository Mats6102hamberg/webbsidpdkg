"use client";

import { useState } from "react";

type ReaderFrameProps = {
  src: string;
  title: string;
  loadingLabel: string;
};

export default function ReaderFrame({ src, title, loadingLabel }: ReaderFrameProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-slate-200">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-slate-600">
          {loadingLabel}
        </div>
      ) : null}
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
