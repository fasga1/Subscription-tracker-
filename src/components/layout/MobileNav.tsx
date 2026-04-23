interface MobileNavProps {
  selectedTab?: "dashboard" | "groups" | "reminders" | "profile";
}

export function MobileNav({ selectedTab = "dashboard" }: MobileNavProps) {
  const tabs = [
    { id: "dashboard", label: "Главная" },
    { id: "groups", label: "Группы" },
    { id: "reminders", label: "Напоминания" },
    { id: "profile", label: "Профиль" },
  ] as const;

  return (
    <nav className="fixed right-0 bottom-0 left-0 border-t bg-background p-3 md:hidden">
      <ul className="grid grid-cols-4 gap-2 text-center text-xs">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={
              tab.id === selectedTab
                ? "rounded-md bg-primary/10 py-1 font-medium text-primary"
                : "rounded-md py-1 text-muted-foreground"
            }
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
