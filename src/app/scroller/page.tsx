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
          ["/scroller/new/header-1754777653164-1.png", "/scroller/new/header-1754777653168-2.png","/scroller/new/hero-section-1754777647631-3.png"],
          ["/scroller/new/hero-section-1754777647613-1.png", "/scroller/new/hero-section-1754777647616-2.png","/scroller/new/hero-section-1754777647631-3.png"],
          ["/scroller/new/content-grid-1754777650984-1.png", "/scroller/new/content-grid-1754777650988-2.png","/scroller/new/content-grid-1754777650991-3.png"],
          ["/scroller/new/footer-1754777649263-1.png", "/scroller/new/footer-1754777649268-2.png","/scroller/new/footer-1754777649272-3.png"],
        ].map((images, index) => (
          <DemoCarousel key={index} images={images} />
        ))}
      </div>
    </main>
  );
}

