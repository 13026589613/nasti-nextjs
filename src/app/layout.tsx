import "@/styles/globals.css";
import "default-passive-events";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/rc-table.scss";

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";

import { BrandonText } from "@/assets/fonts";
import { cn } from "@/lib/utils";

const AuthProvide = dynamic(() => import("@/auth/AuthProvide"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "NASTi",
  description: "NASTi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta
        httpEquiv="Content-Security-Policy"
        content="frame-ancestors 'self' https://us-east-1.quicksight.aws.amazon.com"
      />
      <body className={cn(BrandonText.variable, BrandonText.className)}>
        <ToastContainer
          className={"flex justify-center w-[60vw]"}
          toastClassName={"min-w-[200px] w-auto"}
          position="top-center"
          autoClose={1.5 * 1000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          stacked
        />
        <NextTopLoader color="#d536a5" showSpinner={false} />
        <AuthProvide>
          <ThemeProvider attribute="class" enableSystem={false}>
            {children}
          </ThemeProvider>
        </AuthProvide>
      </body>
    </html>
  );
}
