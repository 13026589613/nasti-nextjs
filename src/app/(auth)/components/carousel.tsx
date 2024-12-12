"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
const CarouselLayout = () => {
  const [api, setApi] = useState<any>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (api) {
      api.on("select", (event: any) => {
        const index = event.selectedScrollSnap();
        setIndex(index);
      });

      setInterval(() => {
        if (index === menuList.length - 1) {
          api.scrollTo(0);
          return;
        }
        api.scrollNext();
      }, 10000);
    }
  }, [api]);
  const menuList = [
    "/images/Intersect01.png",
    "/images/Intersect03.png",
    "/images/Intersect05.png",
  ];
  return (
    <div className="select-none relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
        }}
        orientation="vertical"
        className="w-[909px]"
      >
        <CarouselContent className="-mt-1 h-[519px]">
          {menuList.map((item, index) => (
            <CarouselItem key={index} className="pt-1 md:basis-1/2">
              <Image
                className=" w-[909px] h-[519px]"
                width={909}
                height={519}
                src={item}
                alt=""
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute left-[23px] top-[50%] translate-y-[-50%] flex flex-wrap gap-[18px] w-4 ">
        {menuList.map((item, order) => {
          return (
            <div
              key={order}
              onClick={() => {
                api.scrollTo(order);
              }}
              className={cn(
                "w-[16px] h-[16px] cursor-pointer rounded-full",
                order === index ? "bg-[#EB1DB2]" : "bg-[#fff]"
              )}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default CarouselLayout;
