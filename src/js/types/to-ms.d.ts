declare module 'to-milliseconds' {
  interface TimeDescriptor {
    readonly days?: number;
    readonly hours?: number;
    readonly minutes?: number;
    readonly seconds?: number;
    readonly milliseconds?: number;
    readonly microseconds?: number;
    readonly nanoseconds?: number;
  }

  function convert(time: TimeDescriptor): number;
}
