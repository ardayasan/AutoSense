import ChatInterface from "../components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-800/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-800/20 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AutoSense
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Your AI-powered car benchmarking assistant. Compare technical specifications instantly with RAG technology.
          </p>
        </div>

        <ChatInterface />

        <div className="flex gap-4 text-sm text-slate-500">
          <p>Try asking: "Compare BMW 3 Series 2017 vs Audi A4"</p>
        </div>
      </div>
    </main>
  );
}
