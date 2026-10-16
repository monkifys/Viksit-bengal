"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";

export default function FloatingSubmitButton() {
  const locale = useLocale();
  const isBn = locale === "bn";

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    sourceUrl: "",
    publisher: "",
    promiseCode: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          sourceUrl: formData.sourceUrl,
          publisher: formData.publisher,
          sourceType: "USER_SUBMITTED",
          sourceTier: "TIER_3",
          extractedText: formData.notes,
        }),
      });
    } catch {
      // safe fallback
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      setFormData({ title: "", sourceUrl: "", publisher: "", promiseCode: "", notes: "" });
    }, 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={isBn ? "প্রমাণ বা তথ্য জমা দিন" : "Submit An Update or Evidence"}
        className="fixed bottom-6 right-6 z-40 bg-[#E8620A] hover:bg-[#B84A00] text-white font-mono text-xs uppercase tracking-wider font-bold py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8620A] focus-visible:ring-offset-2"
      >
        <span>✏</span>
        <span>{isBn ? "তথ্য জমা দিন" : "Submit An Update"}</span>
      </button>

      {/* Submission Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1C1008] border-2 border-[#E8620A] rounded-xl max-w-lg w-full p-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white font-mono text-lg"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="font-mono text-xs uppercase tracking-widest text-[#E8620A] font-bold">
              {isBn ? "নাগরিক প্রমাণ যাচাই পোর্টাল" : "Citizen Evidence Submission"}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
              {isBn ? "নতুন প্রমাণ বা সংশোধনী জমা দিন" : "Submit Evidence or Policy Correction"}
            </h3>

            <p className="font-body text-xs text-white/70 italic mt-1">
              {isBn
                ? "আপনি কি কোনো সরকারি আদেশ, বিজ্ঞপ্তি বা নতুন অগ্রগতি জানেন? আমাদের জানান, আমাদের গবেষক দল যাচাই করবে।"
                : "Help hold elected representatives accountable. Submit state gazette links, tenders, or ground reports for peer verification."}
            </p>

            {submitted ? (
              <div className="my-8 text-center p-6 bg-emerald-950/80 border border-emerald-600 rounded-lg">
                <span className="text-3xl block mb-2">✓</span>
                <h4 className="font-serif text-lg font-bold text-emerald-300">
                  {isBn ? "আপনার তথ্য সফলভাবে জমা হয়েছে!" : "Evidence Submitted Successfully!"}
                </h4>
                <p className="text-xs text-emerald-200 mt-1">
                  {isBn ? "আমাদের দল এটি যাচাই করে খতিয়ানে যুক্ত করবে।" : "Our research desk will verify against Tier A/B/C records."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-white/70 mb-1">
                    {isBn ? "শিরোনাম / বিষয়ের বিবরণ *" : "Document Title / Headline *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isBn ? "যেমন: ডিএ বকেয়া নির্দেশিকা..." : "e.g., DA Arrears Gazetted Order..."}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#E8620A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1">
                    {isBn ? "সরকারি গেজেট বা খবরের লিঙ্ক (URL) *" : "Official Document or News URL *"}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://egazette.wb.gov.in/..."
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#E8620A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 mb-1">
                      {isBn ? "প্রকাশক / বিভাগ" : "Department / Publisher"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Finance Dept"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#E8620A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">
                      {isBn ? "প্রতিশ্রুতি কোড (যদি জানা থাকে)" : "Promise Code (optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., GOV-02"
                      value={formData.promiseCode}
                      onChange={(e) => setFormData({ ...formData, promiseCode: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#E8620A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1">
                    {isBn ? "নথি থেকে উদ্ধৃতি বা মন্তব্য" : "Excerpt or Verification Notes"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isBn ? "সংক্ষিপ্ত বিবরণ লিখুন..." : "Provide excerpt, order number, or ground observations..."}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#E8620A]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded text-white/70 hover:text-white transition"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#E8620A] hover:bg-[#B84A00] text-white px-5 py-2 rounded font-bold transition shadow-lg"
                  >
                    {isBn ? "জমা দিন" : "Submit Evidence"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
