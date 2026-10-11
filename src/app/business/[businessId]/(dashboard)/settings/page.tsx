import SettingsHub from "./settings-hub";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <SettingsHub businessId={businessId} />;
}
