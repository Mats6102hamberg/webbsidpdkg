export default function LocaleHomePage({
  params
}: {
  params: { locale: string };
}) {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Hello DKG</h1>
      <p className="mt-2 text-sm text-slate-600">
        Locale: {params.locale}
      </p>
    </main>
  );
}
