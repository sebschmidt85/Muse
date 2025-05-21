"use client";

import { type Dispatch, type ReactNode, type SetStateAction, createContext } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import useLocalStorage from "@/hooks/use-local-storage";
import { SessionProvider } from "next-auth/react";

export const AppContext = createContext<{
  font: string;
  setFont: Dispatch<SetStateAction<string>>;
}>({
  font: "Default",
  setFont: () => {},
});

function ToasterProvider() {
  const { theme } = useTheme();
  return <Toaster theme={theme as "light" | "dark"} />;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [font, setFont] = useLocalStorage<string>("novel__font", "Default");

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem disableTransitionOnChange defaultTheme="system">
        <AppContext.Provider
          value={{
            font,
            setFont,
          }}
        >
          <ToasterProvider />
          {children}
          <Analytics />
        </AppContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
