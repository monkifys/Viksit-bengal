import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 shadow-sm text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#E8620A] text-2xl font-mono font-bold">
            404
          </div>

          <h1 className="font-serif text-2xl font-black text-[#1C1008]">
            Page Not Found / পৃষ্ঠাটি পাওয়া যায়নি
          </h1>

          <p className="text-sm text-stone-600">
            The requested page does not exist. Redirecting you to the Viksit Bengal Dashboard.
          </p>

          <div className="pt-4 flex flex-col gap-2 font-mono text-xs font-bold">
            <Link
              href="/en"
              className="p-3 rounded bg-[#1C1008] text-white hover:bg-[#E8620A] transition-colors"
            >
              🏛️ Go to Viksit Bengal (English)
            </Link>
            <Link
              href="/bn"
              className="p-3 rounded bg-orange-50 text-[#E8620A] border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              🇧🇩 বিকশিত বাংলা ড্যাশবোর্ড (বাংলা)
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
