import ArchMirrorTable from "@/components/Table/ArchLinux";
import { JSX } from "react";

const distro: Record<string, JSX.Element> = {
  "archlinux": <ArchMirrorTable />
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="content-section">
      <div className="w-full flex justify-center !mb-8">
        {distro[slug] || (
          <div className="text-center flex flex-col items-center justify-center h-[85vh]">
            <h1 className="text-2xl font-bold">배포판을 찾을 수 없습니다.</h1>
            <p className="text-sm">지원하지 않는 배포판이거나 아직 추가되지 않았습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
