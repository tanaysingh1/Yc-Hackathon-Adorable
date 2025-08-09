"use client";

import { useMemo, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export type CarouselItemData = { src: string; name: string };

export default function SubmitClient({
  groups,
}: {
  groups: CarouselItemData[][];
}) {
  const apisRef = useRef<CarouselApi[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const setApiAtIndex = (index: number, api: CarouselApi | undefined) => {
    if (!api) return;
    apisRef.current[index] = api;
  };

  const onSubmit = async () => {
    const selections: { name: string; src: string }[] = [];
    for (let i = 0; i < groups.length; i++) {
      const api = apisRef.current[i];
      const group = groups[i] ?? [];
      if (!api || group.length === 0) continue;
      const selectedIndex = api.selectedScrollSnap() ?? 0;
      const clampedIndex = Math.max(0, Math.min(group.length - 1, selectedIndex));
      const selected = group[clampedIndex]!;
      selections.push({ name: selected.name, src: selected.src });
    }

    // Extract filenames from src
    const files = selections
      .map((s) => s.src.split("/").pop())
      .filter((s): s is string => Boolean(s));

    try {
      setSubmitting(true);
      const res = await fetch("/api/mark-selected", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const json = await res.json();
      // Log requested ids and API response
      // IDs are the display names e.g. 1_1, 2_3
      // Files are filenames e.g. 1_1.png
      // eslint-disable-next-line no-console
      console.log({ selectedIds: selections.map((s) => s.name), files, response: json });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col">
        {groups.map((items, index) => (
          <section key={index} className="relative mx-auto w-full overflow-hidden">
            <Carousel
              className="w-full"
              gutter={false}
              opts={{ align: "start", loop: true }}
              setApi={(api) => setApiAtIndex(index, api)}
            >
              <CarouselContent>
                {items.map((item, i) => (
                  <CarouselItem key={i} className="basis-full">
                    <div className="relative">
                      <img src={item.src} alt={item.name} className="block h-auto w-full" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
              <CarouselNext className="right-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
            </Carousel>
          </section>
        ))}
      </div>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <Button
          type="button"
          className="pointer-events-auto rounded-xl"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}


