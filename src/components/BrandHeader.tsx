import Image from "next/image";

export function BrandHeader() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="rounded-3xl border border-borde bg-panelSec/75 p-3 shadow-suave">
          <Image src="/logo-fdcs-una.webp" alt="Logo FDCS UNA" width={110} height={110} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
        </div>
        <div className="rounded-3xl border border-borde bg-panelSec/75 p-3 shadow-suave">
          <Image
            src="/logo-ecp-una.jpeg"
            alt="Logo Escuela de Ciencias Politicas"
            width={110}
            height={110}
            className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
          />
        </div>
      </div>
    </div>
  );
}
