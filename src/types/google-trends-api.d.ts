declare module 'google-trends-api' {
  interface TimelinePoint {
    time: string;
    formattedTime: string;
    formattedAxisTime: string;
    value: number[];
    hasData: boolean[];
    formattedValue: string[];
  }

  interface TimelineData {
    default: {
      timelineData: TimelinePoint[];
      averages: number[];
    };
  }

  interface InterestOverTimeOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    granularTimeResolution?: boolean;
  }

  export function interestOverTime(options: InterestOverTimeOptions): Promise<string>;
  export function relatedQueries(options: any): Promise<string>;
  export function relatedTopics(options: any): Promise<string>;
  export function dailyTrends(options: any): Promise<string>;
  export function realTimeTrends(options: any): Promise<string>;

  const googleTrends: {
    interestOverTime: typeof interestOverTime;
    relatedQueries: typeof relatedQueries;
    relatedTopics: typeof relatedTopics;
    dailyTrends: typeof dailyTrends;
    realTimeTrends: typeof realTimeTrends;
  };

  export default googleTrends;
}
