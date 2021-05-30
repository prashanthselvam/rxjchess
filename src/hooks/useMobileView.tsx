import { useEffect, useState } from "react";

const useMobileView = () => {
  const [mobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== `undefined`) {
      const mql = window.matchMedia("(max-width: 768px)");
      setIsMobileView(mql.matches);
    }
  });

  return mobileView;
};

export default useMobileView;
