import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({
  text = 'Loading...'
}: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-zinc-600 text-sm mt-4">{text}</p>
      </div>
    </div>
  );
}