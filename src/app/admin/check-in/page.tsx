import { AdminPageHeader } from "@/features/admin/AdminTable";
import { CheckInForm } from "@/features/admin/CheckInForm";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default function CheckInPage() {
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-40 w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6">
          <AdminPageHeader kicker="Sala" title="CHECK-IN QR" />
        </div>
      </div>
      <CheckInForm />
    </div>
  );
}
