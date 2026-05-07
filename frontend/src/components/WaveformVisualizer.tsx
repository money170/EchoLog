interface WaveformVisualizerProps {
  bars: number[]
}

export const WaveformVisualizer = ({ bars }: WaveformVisualizerProps) => (
  <div className="waveform" aria-hidden>
    {bars.map((value, index) => (
      <span
        key={`${index}-${value}`}
        style={{
          height: `${Math.max(10, Math.round(value * 72))}px`,
        }}
      />
    ))}
  </div>
)
