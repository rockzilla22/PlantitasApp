export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <div className="text-4xl animate-bounce">🌿</div>
      <p className="text-[var(--text-gray)] font-bold">Cargando tu jardín...</p>
    </div>
  );
}
