import Image from "next/image";

export default function Header() {
  return (
    <header>
      <div className="container navbar">
        <div className="logo">
          <a href="/">
            <Image
              data-cfasync="false"
              loading="eager"
              decoding="async"
              src="/ROKFOSS.webp"
              alt="ROKFOSS 로고"
              width={200}
              height={100}
            />
          </a>
        </div>
        <nav className="nav-links">
          <a href="https://http.krfoss.org" className="menu-item">
            ROKFOSS 분산 미러 바로가기
          </a>
        </nav>
      </div>
    </header>
  );
}
