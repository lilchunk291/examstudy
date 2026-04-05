import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Study from "./pages/Study";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Crisis from "./pages/Crisis";
import Profile from "./pages/Profile";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DeepSession from "./pages/DeepSession";
import SilentRooms from "./pages/SilentRooms";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/deep-session",
    Component: DeepSession,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "schedule", Component: Schedule },
      { path: "study", Component: Study },
      { path: "rooms", Component: SilentRooms },
      { path: "chat", Component: Chat },
      { path: "analytics", Component: Analytics },
      { path: "crisis", Component: Crisis },
      { path: "profile", Component: Profile },
      { path: "vault", Component: Vault },
      { path: "settings", Component: Settings },
      { path: "focus", Component: DeepSession },
      { path: "*", Component: NotFound },
    ],
  },
]);
