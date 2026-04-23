import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Globe, Zap } from "lucide-react";

type NotificationState = {
  pushStudyReminders: boolean;
  emailWeeklyReport: boolean;
  roomInvites: boolean;
  backlogAlerts: boolean;
};

export default function NotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationState>({
    pushStudyReminders: true,
    emailWeeklyReport: false,
    roomInvites: true,
    backlogAlerts: true,
  });

  const settings = [
    {
      id: "pushStudyReminders" as const,
      label: "Push Study Reminders",
      desc: "Browser notifications for upcoming study sessions.",
      icon: Bell,
    },
    {
      id: "emailWeeklyReport" as const,
      label: "Email Weekly Insights",
      desc: "Receive your productivity report every Monday.",
      icon: Mail,
    },
    {
      id: "roomInvites" as const,
      label: "Silent Room Invites",
      desc: "Allow friends to invite you to deep work rooms.",
      icon: Globe,
    },
    {
      id: "backlogAlerts" as const,
      label: "Backlog Critical State",
      desc: "Alerts when arrears clearance targets are at risk.",
      icon: Zap,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notification Settings</h1>
        <p className="text-slate-500 font-semibold">Control when and where you receive updates.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
      >
        <div className="grid gap-6">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <setting.icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold tracking-tight text-slate-900">{setting.label}</div>
                  <div className="text-xs font-bold text-slate-500 tracking-tight">{setting.desc}</div>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    [setting.id]: !prev[setting.id],
                  }))
                }
                className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${
                  notificationSettings[setting.id] ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <motion.div
                  animate={{ x: notificationSettings[setting.id] ? 28 : 4 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
