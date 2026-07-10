import { TopBar } from "@/components/layout/TopBar";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  status: "Active" | "Away" | "In Consultation";
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sarah Jenkins",
    role: "Lead Consulting Partner",
    email: "sjenkins@northbridge.ai",
    status: "In Consultation",
  },
  {
    name: "Alex Rivera",
    role: "Senior Financial Specialist",
    email: "arivera@northbridge.ai",
    status: "Active",
  },
  {
    name: "Marcus Vance",
    role: "Risk & Operations Director",
    email: "mvance@northbridge.ai",
    status: "Active",
  },
  {
    name: "Elena Rostova",
    role: "Market Intelligence Analyst",
    email: "erostova@northbridge.ai",
    status: "Away",
  },
  {
    name: "David Kross",
    role: "Data Scientist & ML Engineer",
    email: "dkross@northbridge.ai",
    status: "Active",
  },
];

export default function TeamPage() {
  return (
    <>
      <TopBar title="Team" />
      <main className="flex-1 p-margin-page max-w-container-max mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Team Members</h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage your firm's specialists and workspace access control.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Name</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Role</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Email</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {TEAM_MEMBERS.map((member, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface font-medium">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 font-body-sm text-body-sm text-secondary">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 font-mono-label text-mono-label text-secondary">
                    {member.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === "Active"
                          ? "bg-surface-container text-on-surface"
                          : member.status === "In Consultation"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-secondary"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
