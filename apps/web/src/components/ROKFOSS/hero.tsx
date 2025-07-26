import { Sparkle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroMessage = [
  "Sync할 Tier 1 미러를 더 빠르게",
  "내가 원하는 국가의 미러만 빠르게 확인하기"
]

export default function Hero() {
  return (
    <div
      id="hero"
      className="flex flex-col items-center justify-center h-auto !my-32"
    >
      <Link
        href="https://http.krfoss.org"
        className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150"
      >
        <div
          aria-hidden
          className="border-background bg-linear-to-b dark:inset-shadow-2xs to-foreground from-primary relative flex size-5 items-center justify-center rounded border shadow-md shadow-black/20 ring-1 ring-black/10"
        >
          <Image
            className="size-3 drop-shadow"
            src="/LOGO.webp"
            alt="ROKFOSS 로고"
            width={24}
            height={24}
          />
        </div>
        <span className="font-medium">ROKFOSS 분산 미러와 함께합니다.</span>
      </Link>
      <h1 className="md:text-4xl text-3xl font-extrabold !mt-8">
        Sync할 Tier 1 미러를 더 빠르게
      </h1>
      <p>전세계에 있는 모든 미러를 한곳에서 확인하세요.</p>
    </div>
  );
}
