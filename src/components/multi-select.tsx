import MultipleSelector, { Option } from "@/components/ui/multiselect";

interface MultiSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const frameworks: Option[] = [
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

export default function MultiSelect({
  id,
  value,
  onChange,
  required,
}: MultiSelectProps) {
  return (
    <div className="*:not-first:mt-2">
      <MultipleSelector
        commandProps={{
          label: "কাজ নির্বাচন করুন",
        }}
        defaultOptions={frameworks}
        placeholder="কাজ নির্বাচন করুন"
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
        value={value ? [{ value, label: value }] : []}
        onChange={(options) => onChange(options[0]?.value || "")}
      />
    </div>
  );
}
