import { Globe } from "lucide-react";

export function GovPHHeader() {
  return (
    <div className="govph-header">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3" />
          <span>REPUBLIC OF THE PHILIPPINES</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>All content is in the public domain unless otherwise stated.</span>
        </div>
      </div>
    </div>
  );
}
