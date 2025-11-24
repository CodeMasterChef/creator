'use client';

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface AdminTabViewProps {
    settings: ReactNode;
    articles: ReactNode;
}

type TabId = "settings" | "articles";

export default function AdminTabView({ settings, articles }: AdminTabViewProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const tabs: Array<{ id: TabId; label: string; icon: string }> = [
        { id: "settings", label: "Cài đặt", icon: "⚙️" },
        { id: "articles", label: "Bài viết", icon: "📰" }
    ];

    const getTabFromParam = (value: string | null): TabId =>
        value === "articles" ? "articles" : "settings";

    const [activeTab, setActiveTab] = useState<TabId>(() =>
        getTabFromParam(searchParams.get("tab"))
    );

    useEffect(() => {
        const targetTab = getTabFromParam(searchParams.get("tab"));
        setActiveTab(prev => (prev === targetTab ? prev : targetTab));
    }, [searchParams]);

    const updateUrl = (tab: TabId) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    return (
        <div className="w-full">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm overflow-hidden">
                <div role="tablist" className="flex">
                    {tabs.map(tab => {
                        const isActive = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                className={`flex-1 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                                    isActive
                                        ? "text-gray-900 dark:text-white bg-primary/15 border-b-2 border-primary"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    updateUrl(tab.id);
                                }}
                            >
                                <span className="text-base">{tab.icon}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6">
                <div className={activeTab === "settings" ? "block" : "hidden"}>{settings}</div>
                <div className={activeTab === "articles" ? "block" : "hidden"}>{articles}</div>
            </div>
        </div>
    );
}
