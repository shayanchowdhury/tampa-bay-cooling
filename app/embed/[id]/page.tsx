import { notFound } from "next/navigation";
import EmbedChat from "../../components/EmbedChat";
import { getBusinessAsync } from "../../../lib/business-store";

export const instant = false;

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessAsync(id);
  if (!business) notFound();

  return (
    <EmbedChat
      business={{
        id: business.id,
        name: business.name,
        greeting: business.greeting,
        phone: business.phone,
      }}
    />
  );
}