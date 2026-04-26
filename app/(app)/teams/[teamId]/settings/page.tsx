import { redirect } from "next/navigation";

type TeamSettingsRedirectProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamSettingsRedirectPage({ params }: TeamSettingsRedirectProps) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/admin`);
}
