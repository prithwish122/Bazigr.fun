"use client"
import Image from "next/image"

const companies = [
  {
    name: "U2U Network",
    // logo: "public/images/u2u.png",
  },
]

export default function Companies() {
  return (
    <section className="w-full py-4 bg-transparent">
      <div className="mx-auto w-[min(92vw,980px)]">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Trusted by 
        </p>
        <div className="flex flex-wrap items-center justify-center mt-8">
          {companies.map((company, index) => (
            <div key={index} className="flex items-center justify-center">
              <Image
                src={ "/images/u2u.png"}
                alt={company.name}
                width={200}
                height={200}
                className=" w-auto transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
