import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const changeLanguage = (lng: string) => {
    setLanguage(lng as any);
  };

  const currentLanguage = language || 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="h-5 w-5 transition-transform hover:scale-110" />
          <span className="sr-only">Toggle language</span>
          <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded px-1">
            {currentLanguage.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className="language-transition cursor-pointer"
        >
          <span className={currentLanguage === "en" ? "font-bold text-primary" : ""}>
            🇬🇧 English
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("sw")}
          className="language-transition cursor-pointer"
        >
          <span className={currentLanguage === "sw" ? "font-bold text-primary" : ""}>
            🇹🇿 Kiswahili
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
