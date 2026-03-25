import { BrandHeader } from "@/components/BrandHeader";
import { SurveyShell } from "@/components/SurveyShell";

export default function SurveyPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-10 md:px-6 md:py-14">
      <div className="mb-8 flex justify-center">
        <BrandHeader />
      </div>
      <SurveyShell />
    </main>
  );
}
