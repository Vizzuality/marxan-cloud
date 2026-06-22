export const REPORT_ROUTE_REGEX = /^\/reports(\/|$)/;

export const isReportRoute = (pathname: string): boolean => REPORT_ROUTE_REGEX.test(pathname);
