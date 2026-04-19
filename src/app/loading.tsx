export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <div className="animate-bounce">
        <img src="/icons/environment/plants/generic.svg" width={48} height={48} alt="" className="object-contain" />
      </div>
      <p className="text-[var(--text-gray)] font-bold">Cargando tu jardín...</p>
    </div>
  );
}
