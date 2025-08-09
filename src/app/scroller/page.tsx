import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import fs from "fs/promises";
import path from "path";

type CarouselItemData = { src: string; name: string };

function DemoCarousel({ items }: { items: CarouselItemData[] }) {
  return (
    <section className="relative mx-auto w-full overflow-hidden">
      <Carousel className="w-full" gutter={false} opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="basis-full">
              <div className="relative">
                <img src={item.src} alt={item.name} className="block h-auto w-full" />
                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  {item.name}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
        <CarouselNext className="right-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
      </Carousel>
    </section>
  );
}

export default async function ScrollerPage() {
  const outputDirFs = path.join(process.cwd(), "public", "scroller", "new");

  let filenames: string[] = [];
  try {
    filenames = await fs.readdir(outputDirFs);
  } catch {
    filenames = [];
  }

  const imageFiles = filenames.filter((name) =>
    name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
  );

  // Build metadata for sorting
  const fileMeta = await Promise.all(
    imageFiles.map(async (name) => {
      const fullPath = path.join(outputDirFs, name);
      const stat = await fs.stat(fullPath).catch(() => undefined);
      return { name, mtimeMs: stat?.mtimeMs ?? 0 };
    })
  );

  // Group by logical sectionName from filename: <section-name>-<timestamp>-<index>.ext
  const sectionToItems = new Map<string, { url: string; idx: number; mtimeMs: number }[]>();
  for (const { name, mtimeMs } of fileMeta) {
    const noExt = name.replace(/\.[^.]+$/i, "");
    const parts = noExt.split("-");
    // Fallbacks to be resilient to unexpected filenames
    const rawIndexStr = parts[parts.length - 1] ?? "0";
    const rawTimestampStr = parts[parts.length - 2] ?? "";
    const sectionName = parts.length >= 3 ? parts.slice(0, -2).join("-") : parts.slice(0, -1).join("-");
    const idx = Number.parseInt(rawIndexStr, 10);
    const url = `/scroller/new/${name}`;
    const arr = sectionToItems.get(sectionName) ?? [];
    arr.push({ url, idx: Number.isFinite(idx) ? idx : 0, mtimeMs });
    sectionToItems.set(sectionName, arr);
  }

  // Sort sections by earliest mtime within the group, then by name
  const sectionsSorted = Array.from(sectionToItems.entries()).sort((a, b) => {
    const aMin = Math.min(...a[1].map((x) => x.mtimeMs));
    const bMin = Math.min(...b[1].map((x) => x.mtimeMs));
    if (aMin !== bMin) return aMin - bMin;
    return a[0].localeCompare(b[0]);
  });

  // Within each section, sort images by idx (1,2,3...), then mtime
  const imageGroups: { src: string; idx: number }[][] = sectionsSorted.map(([_, items]) =>
    items
      .sort((x, y) => (x.idx !== y.idx ? x.idx - y.idx : x.mtimeMs - y.mtimeMs))
      .map((x) => ({ src: x.url, idx: x.idx }))
  );

  // Optionally, normalize to first N groups and first 3 images each if needed
  const normalizedGroups = imageGroups.map((group) => group.slice(0, 3));

  // Assign display names like 1_1, 1_2, 1_3, 2_1, 2_2, 2_3, ...
  const groupsWithNames: CarouselItemData[][] = normalizedGroups.map((group, groupIdx) =>
    group.map((item) => ({ src: item.src, name: `${groupIdx + 1}_${item.idx}` }))
  );

  return (
    <main className="w-full overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col">
        {groupsWithNames.map((items, index) => (
          <DemoCarousel key={index} items={items} />
        ))}
      </div>
    </main>
  );
}

