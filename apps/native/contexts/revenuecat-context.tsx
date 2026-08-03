import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { getNativeEnv } from "@app-catolico/env/native";
import { useAuth } from "@clerk/expo";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

const ENTITLEMENT_ID = "Safe Pro";

type RevenueCatContextValue = {
  /** Local purchase entitlement — for paywall UX only. Product gates use Convex. */
  hasLocalEntitlement: boolean;
  isReady: boolean;
};

const RevenueCatContext = createContext<RevenueCatContextValue>({
  hasLocalEntitlement: false,
  isReady: false,
});

export function useRevenueCat() {
  return useContext(RevenueCatContext);
}

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const [hasLocalEntitlement, setHasLocalEntitlement] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const didConfigure = useRef(false);

  useEffect(() => {
    if (didConfigure.current) return;
    didConfigure.current = true;

    let apiKey: string | undefined;
    try {
      const env = getNativeEnv();
      apiKey =
        Platform.OS === "ios"
          ? env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
          : env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
    } catch {
      apiKey =
        Platform.OS === "ios"
          ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
          : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
    }
    if (!apiKey) {
      if (__DEV__) console.warn(`[RevenueCat] Missing API key for ${Platform.OS}`);
      return;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
    setIsReady(true);
  }, []);

  const updateLocalEntitlement = useCallback((info: CustomerInfo) => {
    const hasEntitlement =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setHasLocalEntitlement(hasEntitlement);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (isSignedIn && userId) {
      Purchases.logIn(userId).then(({ customerInfo }) => {
        updateLocalEntitlement(customerInfo);
      }).catch((e) => {
        if (__DEV__) console.error("[RevenueCat] logIn error:", e);
      });
    } else if (!isSignedIn) {
      Purchases.isAnonymous().then((anonymous) => {
        if (!anonymous) Purchases.logOut().catch(() => {});
      }).catch(() => {});
      setHasLocalEntitlement(false);
    }
  }, [isSignedIn, userId, isReady, updateLocalEntitlement]);

  useEffect(() => {
    if (!isReady) return;

    const listener = (info: CustomerInfo) => {
      updateLocalEntitlement(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isReady, updateLocalEntitlement]);

  return (
    <RevenueCatContext.Provider value={{ hasLocalEntitlement, isReady }}>
      {children}
    </RevenueCatContext.Provider>
  );
}
