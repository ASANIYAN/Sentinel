import { redirect } from "next/navigation";

// The brief refers to the dashboard as "/dashboard", but Task 1 and Task 2
// live at separate routes (see README §5). Send a bare /dashboard visit to
// the Task 1 home screen instead of 404ing.
export default function DashboardIndexPage() {
  redirect("/dashboard/home");
}
