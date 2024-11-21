import Chat from "@/components/prebuilt/chat";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between px-24">
      <div className="w-full min-w-[600px] flex flex-col gap-4">
        <p className="text-[28px] text-center font-medium">
          IEC 61499 FB Generator Assistant
        </p>
        <Chat />
      </div>
    </main>
  );
}
