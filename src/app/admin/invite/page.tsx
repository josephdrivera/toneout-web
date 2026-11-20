import AuthForm from "../../../components/admin/AuthForm";

export const dynamic = "force-dynamic";

export default async function AdminInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthForm mode="invite" token={typeof token === "string" ? token : ""} />
  );
}
