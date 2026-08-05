// plotly.js-cartesian-dist-min 은 공식 타입을 제공하지 않으므로 최소 shim 선언.
declare module 'plotly.js-cartesian-dist-min' {
  const Plotly: {
    newPlot: (...args: unknown[]) => Promise<unknown>
    react: (...args: unknown[]) => Promise<unknown>
    purge: (el: HTMLElement) => void
    Plots: { resize: (el: HTMLElement) => void }
  }
  export default Plotly
}
