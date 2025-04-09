export const LogLevels = ["info", "error"] as const;
export type LogLevel = (typeof LogLevels)[number];
export type LogFunction = (message: string) => void;
export type log = { message: string; level: LogLevel; timestamp: Date };

export type LogCollector = {
  getAll(): log[];
} & {
  [K in LogLevel]: LogFunction;
};
