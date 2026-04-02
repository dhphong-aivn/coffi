"use client";

import { useAppStore } from "@/store/useAppStore";
import { MenuView } from "@/components/views/MenuView";
import { OrdersView } from "@/components/views/OrdersView";
import { TrackingView } from "@/components/views/TrackingView";
import { SettingsView } from "@/components/views/SettingsView";
import { SupportView } from "@/components/views/SupportView";
import { HelpView } from "@/components/views/HelpView";

export function ViewManager() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'menu': return <MenuView />;
    case 'orders': return <OrdersView />;
    case 'tracking': return <TrackingView />;
    case 'settings': return <SettingsView />;
    case 'support': return <SupportView />;
    case 'help': return <HelpView />;
    default: return <MenuView />;
  }
}
