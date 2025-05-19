import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function TopNav() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center justify-between p-3 sticky top-0 z-20 bg-white border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <SidebarTrigger />
          </BreadcrumbItem>
          {pathnames.map((value, idx) => {
            const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
            const isLast = idx === pathnames.length - 1;
            const label = capitalize(decodeURIComponent(value));
            return (
              <React.Fragment key={to}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={to}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <LanguageSelector />
    </div>
  );
}

export default TopNav;
