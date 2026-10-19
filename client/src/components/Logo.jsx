import { Link } from "react-router-dom";
export default function Logo({ to = "/", light }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="h-7 w-7 rounded-lg bg-brand" />
      <span className={`font-display text-xl font-bold ${light ? "text-white" : "text-ink"}`}>TenantFlow</span>
    </Link>
  );
}
