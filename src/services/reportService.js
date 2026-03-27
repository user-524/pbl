import { getReport, getReports } from '../api/services.js'

export const getReportById = async (reportId) => {
  return getReport(reportId)
}

export const getReportList = async () => {
  return getReports()
}
