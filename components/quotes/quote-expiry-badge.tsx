import { Badge } from "@/components/ui/badge";
import { daysUntil } from "@/lib/quotes/defaults";

export function QuoteExpiryBadge({
  validUntil,
  status,
}: {
  validUntil: Date | string | null;
  status: string;
}) {
  if (!validUntil || status === "accepted" || status === "rejected") {
    return null;
  }

  const days = daysUntil(validUntil);
  if (days === null) return null;

  if (days < 0) {
    return <Badge variant="danger">Expired {Math.abs(days)}d ago</Badge>;
  }
  if (days === 0) {
    return <Badge variant="danger">Expires today</Badge>;
  }
  if (days <= 7) {
    return <Badge variant="outline">Expires in {days}d</Badge>;
  }
  return null;
}
