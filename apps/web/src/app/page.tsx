import HeroSection from "@/components/ROKFOSS/hero";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const mirrorList = [
  {
    name: "archlinux",
    displayName: "Arch Linux",
    color: "#1793D1",
  }
];

export default function Home() {
  return (
    <div className="content-section">
      <HeroSection />
      <div
        id="mirrorlist"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-0 gap-y-8 max-w-[800px] mx-auto !mb-8"
      >
        {mirrorList.map((distro) => (
          <Card key={distro.name}>
            <Link
              href={`/mirrorlist/${distro.name}`}
              className="flex flex-col items-center justify-center h-full !mx-4 !my-4"
            >
              <CardTitle className="flex flex-row p-8 gap-4">
                <Image
                  src={`/distro/${distro.name}.svg`}
                  alt={`${distro.name} logo`}
                  width={32}
                  height={32}
                />
                <h3 className="text-2xl font-medium">{distro.displayName}</h3>
              </CardTitle>
            </Link>
          </Card>
        ))}
      </div>
      <div className="flex flex-col items-center mx-auto !mt-32 !my-16 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          여기에 있는 모든 내용은 위 리스트에 있는 배포판이 서명하거나 인증하지 않았습니다.
          <br />
          문제가 되거나 미러를 추가하고 싶은 경우 아래의 이메일로 연락해주세요.
        </p>
        <a
          href="mailto:support+mirrorlist@imnya.ng"
          className="text-blue-300 hover:underline mt-2 text-center"
        >
          support+mirrorlist@imnya.ng
        </a>
      </div>
    </div>
  );
}
