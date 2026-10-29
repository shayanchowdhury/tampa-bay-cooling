import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmbedChat from "../../components/EmbedChat";
import { getBusiness } from "../../../lib/businesses";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusiness(id);
  if (!business) notFound();

  return <EmbedChat businessId={business.id} />;
}