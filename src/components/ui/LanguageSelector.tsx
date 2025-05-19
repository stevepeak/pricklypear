import React from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LOCALES } from "@/i18n";

import enFlag from "@/assets/flags/en-US.svg";
import esFlag from "@/assets/flags/es-ES.svg";
import frFlag from "@/assets/flags/fr-FR.svg";

const localeMeta: Record<(typeof SUPPORTED_LOCALES)[number], { label: string; flag: string }> = {
  "en-US": { label: "English", flag: enFlag },
  "es-ES": { label: "Español", flag: esFlag },
  "fr-FR": { label: "Français", flag: frFlag },
};

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = i18n.language as (typeof SUPPORTED_LOCALES)[number];

  const handleSelect = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-muted hover:bg-muted/80 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Change language"
        >
          <img src={localeMeta[current]?.flag} alt="flag" className="h-4 w-6 object-cover" />
          <span className="font-medium hidden sm:block">{current.split("-")[0].toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => handleSelect(code)}
            className="flex items-center gap-2"
          >
            <img src={localeMeta[code].flag} alt="flag" className="h-4 w-6 object-cover" />
            <span>{localeMeta[code].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
