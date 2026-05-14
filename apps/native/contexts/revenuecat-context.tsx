import { api } from "@app-catolico/backend/convex/_generated/api";
import { useAuth } from "@clerk/expo";
import { useMutation } from "convex/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

const ENTITLEMENT_ID = "Safe Pro";

type RevenueCatContextValue = {
  isPremium: boolean;
  isReady: boolean;
};

const RevenueCatContext = createContext<RevenueCatContextValue>({
  isPremium: false,
  isReady: false,
});

export function useRevenueCat() {
  return useContext(RevenueCatContext);
}

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const syncPremium = useMutation(api.users.syncPremiumFromClient);
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const didConfigure = useRef(false);
  const lastSyncedValue = useRef<boolean | null>(null);

  useEffect(() => {
    if (didConfigure.current) return;
    didConfigure.current = true;

    const apiKey = Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
      : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
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

  useEffect(() => {
    if (!isReady) return;

    if (isSignedIn && userId) {
      Purchases.logIn(userId).then(({ customerInfo }) => {
        updatePremiumStatus(customerInfo);
      }).catch((e) => {
        if (__DEV__) console.error("[RevenueCat] logIn error:", e);
      });
    } else if (!isSignedIn) {
      Purchases.isAnonymous().then((anonymous) => {
        if (!anonymous) Purchases.logOut().catch(() => {});
      }).catch(() => {});
      setIsPremium(false);
    }
  }, [isSignedIn, userId, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const listener = (info: CustomerInfo) => {
      updatePremiumStatus(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isReady]);

  const updatePremiumStatus = useCallback((info: CustomerInfo) => {
    const hasEntitlement =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsPremium(hasEntitlement);

    if (lastSyncedValue.current !== hasEntitlement && isSignedIn) {
      lastSyncedValue.current = hasEntitlement;
      syncPremium({ isPremium: hasEntitlement }).catch((e) => {
        if (__DEV__) console.error("[RevenueCat] sync error:", e);
      });
    }
  }, [isSignedIn, syncPremium]);

  return (
    <RevenueCatContext.Provider value={{ isPremium, isReady }}>
      {children}
    </RevenueCatContext.Provider>
  );
}
