"use client";

import React, { createContext, useContext, useState } from "react";

type HeaderControlContextType = {
  isPageHeaderVisible: boolean;
  togglePageHeader: () => void;
  setPageHeaderVisible: (visible: boolean) => void;
  headerCenter: React.ReactNode;
  setHeaderCenter: (node: React.ReactNode) => void;
  headerRight: React.ReactNode;
  setHeaderRight: (node: React.ReactNode) => void;
};

const HeaderControlContext = createContext<
  HeaderControlContextType | undefined
>(undefined);

export function HeaderControlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPageHeaderVisible, setPageHeaderVisible] = useState(true);
  const [headerCenter, setHeaderCenter] = useState<React.ReactNode>(null);
  const [headerRight, setHeaderRight] = useState<React.ReactNode>(null);

  const togglePageHeader = () => {
    setPageHeaderVisible((prev) => !prev);
  };

  return (
    <HeaderControlContext.Provider
      value={{
        isPageHeaderVisible,
        togglePageHeader,
        setPageHeaderVisible,
        headerCenter,
        setHeaderCenter,
        headerRight,
        setHeaderRight,
      }}
    >
      {children}
    </HeaderControlContext.Provider>
  );
}

export function useHeaderControl() {
  const context = useContext(HeaderControlContext);
  if (context === undefined) {
    throw new Error(
      "useHeaderControl must be used within a HeaderControlProvider"
    );
  }
  return context;
}
