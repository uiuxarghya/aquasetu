import SideMenuContent from "@/components/side-menu-content";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={SideMenuContent}
      screenOptions={{
        drawerPosition: "left",
        drawerType: "slide",
        swipeEnabled: true,
        swipeEdgeWidth: 50,
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
