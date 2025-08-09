import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function DemoCarousel({ images }: { images: string[] }) {
  return (
    <section className="relative mx-auto w-full overflow-hidden">
      <Carousel className="w-full" gutter={false} opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index} className="basis-full">
              <img src={src} alt="" className="block h-auto w-full" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
        <CarouselNext className="right-2 rounded-none bg-black/30 text-white shadow-none hover:bg-black/40" />
      </Carousel>
    </section>
  );
}

export default function ScrollerPage() {
  return (
    <main className="w-full overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col">
        {[
          ["/scroller/lovable/1.png", "/scroller/v0/1.png"],
          ["/scroller/lovable/2.png", "/scroller/v0/2.png"],
          ["/scroller/lovable/3.png", "/scroller/v0/3.png"],
          ["/scroller/lovable/4.png", "/scroller/v0/4.png"],
        ].map((images, index) => (
          <DemoCarousel key={index} images={images} />
        ))}
      </div>
    </main>
  );
}

