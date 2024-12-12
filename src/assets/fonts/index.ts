import localFont from "next/font/local";

export const BrandonText = localFont({
  src: [
    {
      path: "./BrandonText/BrandonText-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./BrandonText/BrandonText-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./BrandonText/BrandonText-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./BrandonText/BrandonText-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./BrandonText/BrandonText-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-BrandonText",
});
