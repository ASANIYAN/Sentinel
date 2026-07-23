type Props = {
  connected: boolean;
};

// Reconnect-with-backoff is handled by the browser's native EventSource
// retry — no custom logic needed for the "simple" reconnect the ticket
// asks for.
export function LiveIndicator({ connected }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span className="relative flex size-2">
        {connected && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-75" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            connected ? "bg-positive" : "bg-text-secondary"
          }`}
        />
      </span>
      {connected ? "Live" : "Offline"}
    </span>
  );
}
