"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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

const frameworks = [
  {
    value: "Construction",
    label: "Construction | নির্মাণ",
  },
  {
    value: "Household Worker",
    label: "Household Worker | গৃহকর্মী",
  },
  {
    value: "Manufacturing",
    label: "Manufacturing | উৎপাদন",
  },
  {
    value: "Hospitality & Tourism",
    label: "Hospitality & Tourism | আতিথেয়তা ও পর্যটন",
  },
  {
    value: "Healthcare",
    label: "Healthcare | স্বাস্থ্যসেবা",
  },
  {
    value: "Retail & Sales",
    label: "Retail & Sales | খুচরা ও বিক্রয়",
  },
  {
    value: "Transportation",
    label: "Transportation | পরিবহন",
  },
  {
    value: "Agriculture",
    label: "Agriculture | কৃষি",
  },
  {
    value: "Cleaning & Maintenance",
    label: "Cleaning & Maintenance | পরিচ্ছন্নতা ও রক্ষণাবেক্ষণ",
  },
  {
    value: "Security",
    label: "Security | নিরাপত্তা",
  },
  {
    value: "IT & Technology",
    label: "IT & Technology | আইটি ও প্রযুক্তি",
  },
  {
    value: "Education",
    label: "Education | শিক্ষা",
  },
  {
    value: "Professional Services",
    label: "Professional Services | পেশাদার সেবা",
  },
  {
    value: "Other",
    label: "Other | অন্যান্য",
  },
];

interface SelectSearchProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SelectSearch({
  id,
  value,
  onChange,
  required,
}: SelectSearchProps) {
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
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? frameworks.find((framework) => framework.value === value)
                    ?.label
                : "কাজ নির্বাচন করুন"}
            </span>
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
            <CommandInput placeholder="কাজ খুঁজুন..." />
            <CommandList>
              <CommandEmpty>পাওয়া যায় নি</CommandEmpty>
              <CommandGroup>
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    {value === framework.value && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
