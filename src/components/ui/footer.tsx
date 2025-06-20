import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full bg-bgLight border-t border-border py-6 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2 text-sm text-muted-foreground">
        <div className="mb-2 md:mb-0">
          © {new Date().getFullYear()} Prickly Pear
        </div>
        <Separator
          className="hidden md:block h-6 mx-4"
          orientation="vertical"
        />
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="hidden md:inline">|</span>
          <Link to="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
