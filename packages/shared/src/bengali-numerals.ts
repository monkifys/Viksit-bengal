const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBengaliNumerals(num: string | number): string {
  return num.toString().replace(/[0-9]/g, w => banglaDigits[+w]);
}