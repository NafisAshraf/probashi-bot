"use client";

import { Fragment, useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const countries = [
  {
    continent: "Middle East",
    items: [
      { value: "Saudi Arabia | সৌদি আরব", flag: "🇸🇦" },
      { value: "UAE | সংযুক্ত আরব আমিরাত", flag: "🇦🇪" },
      { value: "Dubai | দুবাই", flag: "🇦🇪" },
      { value: "Abu Dhabi | আবুধাবি", flag: "🇦🇪" },
      { value: "Qatar | কাতার", flag: "🇶🇦" },
      { value: "Kuwait | কুয়েত", flag: "🇰🇼" },
      { value: "Bahrain | বাহরাইন", flag: "🇧🇭" },
      { value: "Oman | ওমান", flag: "🇴🇲" },
      { value: "Jordan | জর্ডান", flag: "🇯🇴" },
      { value: "Lebanon | লেবানন", flag: "🇱🇧" },
    ],
  },
  {
    continent: "Asia",
    items: [
      { value: "Japan | জাপান", flag: "🇯🇵" },
      { value: "Malaysia | মালয়েশিয়া", flag: "🇲🇾" },
      { value: "Singapore | সিঙ্গাপুর", flag: "🇸🇬" },
      { value: "China | চীন", flag: "🇨🇳" },
      { value: "India | ভারত", flag: "🇮🇳" },
      { value: "Pakistan | পাকিস্তান", flag: "🇵🇰" },
      { value: "Nepal | নেপাল", flag: "🇳🇵" },
      { value: "Sri Lanka | শ্রীলঙ্কা", flag: "🇱🇰" },
      { value: "Myanmar | মায়ানমার", flag: "🇲🇲" },
      { value: "South Korea | দক্ষিণ কোরিয়া", flag: "🇰🇷" },
      { value: "Indonesia | ইন্দোনেশিয়া", flag: "🇮🇩" },
      { value: "Thailand | থাইল্যান্ড", flag: "🇹🇭" },
      { value: "Vietnam | ভিয়েতনাম", flag: "🇻🇳" },
      { value: "Philippines | ফিলিপাইন", flag: "🇵🇭" },
    ],
  },
  {
    continent: "North America",
    items: [
      { value: "United States of America (USA) | যুক্তরাষ্ট্র", flag: "🇺🇸" },
      { value: "Canada | কানাডা", flag: "🇨🇦" },
      { value: "Mexico | মেক্সিকো", flag: "🇲🇽" },
    ],
  },
  {
    continent: "South America",
    items: [
      { value: "Brazil | ব্রাজিল", flag: "🇧🇷" },
      { value: "Argentina | আর্জেন্টিনা", flag: "🇦🇷" },
      { value: "Colombia | কলম্বিয়া", flag: "🇨🇴" },
      { value: "Chile | চিলি", flag: "🇨🇱" },
      { value: "Peru | পেরু", flag: "🇵🇪" },
    ],
  },
  {
    continent: "Africa",
    items: [
      { value: "South Africa | দক্ষিণ আফ্রিকা", flag: "🇿🇦" },
      { value: "Nigeria | নাইজেরিয়া", flag: "🇳🇬" },
      { value: "Morocco | মরক্কো", flag: "🇲🇦" },
      { value: "Egypt | মিশর", flag: "🇪🇬" },
      { value: "Kenya | কেনিয়া", flag: "🇰🇪" },
      { value: "Ethiopia | ইথিওপিয়া", flag: "🇪🇹" },
      { value: "Ghana | ঘানা", flag: "🇬🇭" },
      { value: "Tanzania | তানজানিয়া", flag: "🇹🇿" },
    ],
  },
  {
    continent: "Europe",
    items: [
      { value: "United Kingdom (UK) | যুক্তরাজ্য", flag: "🇬🇧" },
      { value: "France | ফ্রান্স", flag: "🇫🇷" },
      { value: "Germany | জার্মানি", flag: "🇩🇪" },
      { value: "Italy | ইতালি", flag: "🇮🇹" },
      { value: "Spain | স্পেন", flag: "🇪🇸" },
      { value: "Netherlands | নেদারল্যান্ডস", flag: "🇳🇱" },
      { value: "Sweden | সুইডেন", flag: "🇸🇪" },
      { value: "Norway | নরওয়ে", flag: "🇳🇴" },
      { value: "Denmark | ডেনমার্ক", flag: "🇩🇰" },
      { value: "Finland | ফিনল্যান্ড", flag: "🇫🇮" },
      { value: "Poland | পোল্যান্ড", flag: "🇵🇱" },
      { value: "Switzerland | সুইজারল্যান্ড", flag: "🇨🇭" },
    ],
  },
  {
    continent: "Oceania",
    items: [
      { value: "Australia | অস্ট্রেলিয়া", flag: "🇦🇺" },
      { value: "New Zealand | নিউজিল্যান্ড", flag: "🇳🇿" },
      { value: "Fiji | ফিজি", flag: "🇫🇯" },
      { value: "Papua New Guinea | পাপুয়া নিউ গিনি", flag: "🇵🇬" },
      { value: "Solomon Islands | সলোমন দ্বীপপুঞ্জ", flag: "🇸🇧" },
    ],
  },
];

interface CountrySelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function CountrySelect({
  id,
  value,
  onChange,
  required,
}: CountrySelectProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] border"
          >
            {value ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none">
                  {
                    countries
                      .map((group) =>
                        group.items.find((item) => item.value === value)
                      )
                      .filter(Boolean)[0]?.flag
                  }
                </span>
                <span className="truncate">{value}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                কোথায় কাজ করতে চান?
              </span>
            )}
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              {countries.map((group) => (
                <Fragment key={group.continent}>
                  <CommandGroup heading={group.continent}>
                    {group.items.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.value}
                        onSelect={(currentValue) => {
                          onChange(currentValue);
                          setOpen(false);
                        }}
                      >
                        <span className="text-lg leading-none">
                          {country.flag}
                        </span>{" "}
                        {country.value}
                        {value === country.value && (
                          <CheckIcon size={16} className="ml-auto" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
