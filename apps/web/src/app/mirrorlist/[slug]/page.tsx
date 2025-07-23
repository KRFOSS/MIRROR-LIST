import MirrorTable from "@/components/Table";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="content-section">
      <p>Distro: {slug}</p>
      <div className="w-full flex justify-center !mb-8">
        <MirrorTable distro={slug} />
      </div>
    </div>
  );
}
